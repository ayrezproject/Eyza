'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@eyza/database'
import { revalidatePath } from 'next/cache'
import type { TaskPlan } from '@eyza/types'

export async function sendMessage(projectId: string, conversationId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const text = content.trim()
  if (!text) return

  // 1. Create User Message
  await prisma.message.create({
    data: {
      conversationId,
      role: 'user',
      content: text,
    },
  })

  // 2. Create Task in PLANNING state
  const task = await prisma.task.create({
    data: {
      projectId,
      conversationId,
      instruction: text,
      state: 'PLANNING',
      startedAt: new Date(),
    },
  })

  // Log transition: CREATED -> PLANNING (analyze_request)
  await prisma.taskStateTransition.create({
    data: {
      taskId: task.id,
      fromState: 'CREATED',
      toState: 'PLANNING',
      event: 'analyze_request',
      metadata: { instruction: text },
    },
  })

  // 3. Generate initial execution plan preview (Milestone 2 baseline)
  const generatedPlan: TaskPlan = {
    summary: `Implementasi: ${text.slice(0, 100)}`,
    estimatedFileCount: 3,
    steps: [
      {
        index: 1,
        description: 'Analisis kebutuhan arsitektur dan file proyek',
        estimatedFiles: ['package.json'],
        status: 'pending',
      },
      {
        index: 2,
        description: 'Pembuatan / pembaruan kode komponen utama',
        estimatedFiles: ['src/App.tsx', 'src/components/Main.tsx'],
        status: 'pending',
      },
      {
        index: 3,
        description: 'Verifikasi build & uji tipe data TypeScript',
        estimatedFiles: [],
        status: 'pending',
      },
    ],
  }

  // Update Task: PLANNING -> AWAITING_APPROVAL (plan_ready)
  await prisma.task.update({
    where: { id: task.id },
    data: {
      state: 'AWAITING_APPROVAL',
      prevState: 'PLANNING',
      plan: generatedPlan as unknown as object,
    },
  })

  // Log transition: PLANNING -> AWAITING_APPROVAL (plan_ready)
  await prisma.taskStateTransition.create({
    data: {
      taskId: task.id,
      fromState: 'PLANNING',
      toState: 'AWAITING_APPROVAL',
      event: 'plan_ready',
      metadata: { stepsCount: generatedPlan.steps.length },
    },
  })

  // 4. Create Assistant message displaying readiness
  await prisma.message.create({
    data: {
      conversationId,
      role: 'assistant',
      content: `Saya telah menganalisis instruksi Anda:\n\n"${text}"\n\nRencana eksekusi telah dibuat. Silakan tinjau dan konfirmasi rencana di bawah ini untuk memulai proses coding.`,
    },
  })

  revalidatePath(`/projects/${projectId}`)
}

export async function respondToPlan(taskId: string, action: 'approve' | 'reject') {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  })

  if (!task || task.state !== 'AWAITING_APPROVAL') {
    throw new Error('Task not found or not awaiting approval')
  }

  if (action === 'approve') {
    // Transition: AWAITING_APPROVAL -> CODING (user_approved)
    await prisma.task.update({
      where: { id: taskId },
      data: {
        state: 'CODING',
        prevState: 'AWAITING_APPROVAL',
      },
    })

    await prisma.taskStateTransition.create({
      data: {
        taskId,
        fromState: 'AWAITING_APPROVAL',
        toState: 'CODING',
        event: 'user_approved',
      },
    })

    await prisma.agentLog.create({
      data: {
        taskId,
        agent: 'orchestrator',
        level: 'info',
        message: 'Plan disetujui pengguna. Memulai agent Coder.',
      },
    })

    await prisma.message.create({
      data: {
        conversationId: task.conversationId,
        role: 'assistant',
        content: `Rencana telah disetujui! Task beralih ke state **CODING**. Agent Coder mulai mempersiapkan perubahan file.`,
      },
    })
  } else {
    // Transition: AWAITING_APPROVAL -> CANCELLED (user_rejected)
    await prisma.task.update({
      where: { id: taskId },
      data: {
        state: 'CANCELLED',
        prevState: 'AWAITING_APPROVAL',
      },
    })

    await prisma.taskStateTransition.create({
      data: {
        taskId,
        fromState: 'AWAITING_APPROVAL',
        toState: 'CANCELLED',
        event: 'user_rejected',
      },
    })

    await prisma.message.create({
      data: {
        conversationId: task.conversationId,
        role: 'assistant',
        content: `Rencana telah dibatalkan atas permintaan pengguna. Task ditutup.`,
      },
    })
  }

  revalidatePath(`/projects/${task.projectId}`)
}
