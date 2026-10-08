import type { TaskState } from '@eyza/types'

const BADGE_STYLES: Record<TaskState, { bg: string; text: string; dot: string; label: string }> = {
  CREATED: {
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-400',
    dot: 'bg-zinc-400',
    label: 'Created',
  },
  PLANNING: {
    bg: 'bg-amber-950/40 border border-amber-800/40',
    text: 'text-amber-400',
    dot: 'bg-amber-400 animate-pulse',
    label: 'Planning',
  },
  AWAITING_APPROVAL: {
    bg: 'bg-indigo-950/40 border border-indigo-700/50',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
    label: 'Awaiting Approval',
  },
  CODING: {
    bg: 'bg-blue-950/40 border border-blue-700/40',
    text: 'text-blue-400',
    dot: 'bg-blue-400 animate-pulse',
    label: 'Coding',
  },
  REVIEWING: {
    bg: 'bg-purple-950/40 border border-purple-700/40',
    text: 'text-purple-400',
    dot: 'bg-purple-400 animate-pulse',
    label: 'Reviewing',
  },
  COMMITTING: {
    bg: 'bg-sky-950/40 border border-sky-700/40',
    text: 'text-sky-400',
    dot: 'bg-sky-400 animate-pulse',
    label: 'Committing',
  },
  BUILDING: {
    bg: 'bg-orange-950/40 border border-orange-700/40',
    text: 'text-orange-400',
    dot: 'bg-orange-400 animate-pulse',
    label: 'Building',
  },
  DEPLOYING: {
    bg: 'bg-teal-950/40 border border-teal-700/40',
    text: 'text-teal-400',
    dot: 'bg-teal-400 animate-pulse',
    label: 'Deploying',
  },
  COMPLETED: {
    bg: 'bg-emerald-950/40 border border-emerald-800/40',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    label: 'Completed',
  },
  PAUSED: {
    bg: 'bg-zinc-800 border border-zinc-700',
    text: 'text-zinc-300',
    dot: 'bg-zinc-400',
    label: 'Paused',
  },
  CANCELLED: {
    bg: 'bg-zinc-900 border border-zinc-800',
    text: 'text-zinc-500',
    dot: 'bg-zinc-600',
    label: 'Cancelled',
  },
  FAILED: {
    bg: 'bg-rose-950/40 border border-rose-800/40',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
    label: 'Failed',
  },
  TIMED_OUT: {
    bg: 'bg-amber-950/40 border border-amber-800/40',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
    label: 'Timed Out',
  },
}

export function TaskBadge({ state }: { state: TaskState | string }) {
  const current = BADGE_STYLES[state as TaskState] ?? {
    bg: 'bg-zinc-800',
    text: 'text-zinc-400',
    dot: 'bg-zinc-500',
    label: state,
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${current.bg} ${current.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  )
}
