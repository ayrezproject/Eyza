'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@eyza/database'
import { redirect } from 'next/navigation'
import type { ProjectFramework } from '@eyza/types'

export async function createProject(formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const framework = (formData.get('framework') as ProjectFramework) || 'nextjs'
  const repoOwner = formData.get('repoOwner') as string | null
  const repoName = formData.get('repoName') as string | null

  if (!name || name.trim().length === 0) {
    throw new Error('Project name is required')
  }

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        framework,
        userId,
      },
    })

    // If GitHub repository details provided, create repository record
    if (repoOwner && repoName) {
      const fullName = `${repoOwner}/${repoName}`
      await tx.repository.create({
        data: {
          projectId: createdProject.id,
          owner: repoOwner.trim(),
          name: repoName.trim(),
          fullName: fullName.trim(),
          url: `https://github.com/${fullName.trim()}`,
          defaultBranch: 'main',
        },
      })
    }

    // Create initial conversation for project
    await tx.conversation.create({
      data: {
        projectId: createdProject.id,
        userId,
      },
    })

    return createdProject
  })

  redirect(`/projects/${project.id}`)
}
