import { auth } from '@/lib/auth'
import { prisma } from '@eyza/database'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { TaskBadge } from '@/components/TaskBadge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — EYZA' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [projects, runningTasks, totalBuilds, totalDeployments] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { repository: true },
    }),
    prisma.task.findMany({
      where: {
        project: { userId: session.user.id },
        state: { notIn: ['COMPLETED', 'CANCELLED', 'FAILED', 'TIMED_OUT'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.build.count({
      where: { task: { project: { userId: session.user.id } } },
    }),
    prisma.deployment.count({
      where: { task: { project: { userId: session.user.id } } },
    }),
  ])

  return (
    <div className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar user={session.user} />

      <main className="flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">Welcome back, {session.user.name}</p>
          </div>
          <Link
            href="/projects/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            + New Project
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Active Tasks" value={runningTasks.length} />
          <StatCard label="Builds" value={totalBuilds} />
          <StatCard label="Deployments" value={totalDeployments} />

        </div>

        {/* Recent projects */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Recent Projects
          </h2>
          {projects.length === 0 ? (
            <EmptyState
              message="No projects yet."
              action={{ label: 'Create your first project', href: '/projects/new' }}
            />
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4 transition hover:border-zinc-700"
                >
                  <div>
                    <p className="font-medium text-zinc-100">{project.name}</p>
                    <p className="text-xs text-zinc-500">{project.framework}</p>
                  </div>
                  <span className="text-xs text-zinc-600">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Active tasks */}
        {runningTasks.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Active Tasks
            </h2>
            <div className="space-y-2">
              {runningTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4"
                >
                  <p className="text-sm text-zinc-300 line-clamp-1">{task.instruction}</p>
                  <TaskBadge state={task.state} />
                </div>
              ))}
            </div>
          </section>
        )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  )
}


function EmptyState({
  message,
  action,
}: {
  message: string
  action?: { label: string; href: Parameters<typeof Link>[0]['href'] }
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-800 px-6 py-10 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-3 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          {action.label} →
        </Link>
      )}
    </div>
  )
}
