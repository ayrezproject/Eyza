import type { TaskStateTransition, AgentLog } from '@eyza/types'

interface ActivityItem {
  id: string
  timestamp: string | Date
  title: string
  detail?: string | null | undefined
  type: 'transition' | 'agent'
  badge?: string
}

interface ActivityLogProps {
  transitions?: (TaskStateTransition & { createdAt: Date | string })[]
  logs?: (AgentLog & { createdAt: Date | string })[]
}

export function ActivityLog({ transitions = [], logs = [] }: ActivityLogProps) {
  // Combine transitions and logs into chronological feed
  const items: ActivityItem[] = [
    ...transitions.map((t) => ({
      id: t.id,
      timestamp: t.createdAt,
      title: `State changed: ${t.fromState ?? 'INIT'} → ${t.toState}`,
      detail: t.event ? `Event: ${t.event}` : null,
      type: 'transition' as const,
      badge: t.toState,
    })),
    ...logs.map((l) => ({
      id: l.id,
      timestamp: l.createdAt,
      title: `[${l.agent}] ${l.message}`,
      type: 'agent' as const,
      badge: l.level.toUpperCase(),
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-xs text-zinc-500">
        Belum ada aktivitas terekam.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-3 text-xs"
        >
          <div className="mt-0.5 flex h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-zinc-200 truncate">{item.title}</span>
              <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            {item.detail && (
              <p className="mt-1 text-zinc-400 font-mono text-[11px] truncate">
                {item.detail}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
