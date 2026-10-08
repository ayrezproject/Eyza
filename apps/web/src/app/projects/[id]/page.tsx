import { auth } from '@/lib/auth'
import { prisma } from '@eyza/database'
import { notFound, redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { TaskBadge } from '@/components/TaskBadge'
import { ActivityLog } from '@/components/ActivityLog'
import { ChatInterface } from '@/components/ChatInterface'
import type { Metadata } from 'next'
import type { TaskPlan } from '@eyza/types'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })
  return {
    title: project ? `${project.name} — EYZA` : 'Project — EYZA',
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id, userId: session.user.id },
    include: {
      repository: true,
      conversations: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          stateTransitions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          agentLogs: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Get or create conversation
  let conversation = project.conversations[0]
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    })
  }

  const activeTask = project.tasks.find(
    (t) => !['COMPLETED', 'CANCELLED', 'FAILED', 'TIMED_OUT'].includes(t.state)
  ) ?? project.tasks[0]

  const transitions = project.tasks.flatMap((t) => t.stateTransitions)
  const agentLogs = project.tasks.flatMap((t) => t.agentLogs)

  return (
    <div className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar user={session.user} />

      <main className="flex-1 mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Project Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{project.name}</h1>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono text-zinc-300 uppercase">
                {project.framework}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-zinc-400">{project.description}</p>
            )}
            {project.repository && (
              <a
                href={project.repository.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-mono mt-1"
              >
                <span>📦 {project.repository.fullName}</span>
                <span>↗</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs text-zinc-500">Status Task Terakhir:</span>
            {activeTask ? (
              <TaskBadge state={activeTask.state} />
            ) : (
              <span className="text-xs text-zinc-500">Tidak ada task aktif</span>
            )}
          </div>
        </div>

        {/* 2-Column Interface: Chat on Left, Task Status & Activity on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Interface (col-span-8) */}
          <div className="lg:col-span-8">
            <ChatInterface
              projectId={project.id}
              conversationId={conversation.id}
              initialMessages={conversation.messages.map((m) => ({
                ...m,
                createdAt: m.createdAt.toISOString(),
              }))}
              activeTask={
                activeTask
                  ? {
                      ...activeTask,
                      plan: activeTask.plan as unknown as TaskPlan | null,
                      prevState: activeTask.prevState ?? null,
                      fixHistory: [],
                      costUsd: Number(activeTask.costUsd),
                      startedAt: activeTask.startedAt?.toISOString() ?? null,
                      pausedAt: activeTask.pausedAt?.toISOString() ?? null,
                      completedAt: activeTask.completedAt?.toISOString() ?? null,
                      timeoutAt: activeTask.timeoutAt?.toISOString() ?? null,
                      createdAt: activeTask.createdAt.toISOString(),
                      updatedAt: activeTask.updatedAt.toISOString(),
                    }
                  : null
              }
            />
          </div>

          {/* Right Sidebar: Task Status & Activity Log (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Task Details Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Task Terkini
                </h2>
                {activeTask && <TaskBadge state={activeTask.state} />}
              </div>

              {activeTask ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Instruksi:</span>
                    <p className="font-medium text-zinc-200 mt-0.5 line-clamp-3">
                      {activeTask.instruction}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
                    <div>
                      <span className="text-zinc-500">Token Digunakan:</span>
                      <p className="font-mono text-zinc-200">{activeTask.tokenUsed.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Estimasi Cost:</span>
                      <p className="font-mono text-zinc-200">${Number(activeTask.costUsd).toFixed(4)}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Percobaan (Retry):</span>
                      <p className="font-mono text-zinc-200">{activeTask.retryCount} / {activeTask.maxRetries}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Dimulai:</span>
                      <p className="font-mono text-zinc-400">
                        {activeTask.startedAt
                          ? new Date(activeTask.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Kirim instruksi di chat untuk memulai task baru.
                </p>
              )}
            </div>

            {/* Activity Log Feed */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Activity Log
                </h2>
                <span className="text-[10px] text-zinc-500 font-mono">Real-time trace</span>
              </div>

              <ActivityLog
                transitions={transitions.map((t) => ({
                  ...t,
                  fromState: t.fromState ?? null,
                  metadata: t.metadata as Record<string, unknown> | null,
                  createdAt: t.createdAt.toISOString(),
                }))}
                logs={agentLogs.map((l) => ({
                  ...l,
                  metadata: l.metadata as Record<string, unknown> | null,
                  createdAt: l.createdAt.toISOString(),
                }))}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
