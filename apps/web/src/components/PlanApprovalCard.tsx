'use client'

import { useTransition } from 'react'
import type { TaskPlan } from '@eyza/types'

interface PlanApprovalCardProps {
  taskId: string
  plan: TaskPlan
  onAction?: (action: 'approve' | 'reject') => Promise<void>
}

export function PlanApprovalCard({ taskId, plan, onAction }: PlanApprovalCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (action: 'approve' | 'reject') => {
    if (!onAction) return
    startTransition(async () => {
      await onAction(action)
    })
  }

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          <h3 className="text-sm font-semibold text-indigo-200">
            EYZA Execution Plan — Menunggu Konfirmasi
          </h3>
        </div>
        <span className="text-xs text-indigo-300 font-mono">
          Task #{taskId.slice(-6)}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium text-white mb-3">
          {plan.summary}
        </p>

        {plan.steps && plan.steps.length > 0 && (
          <div className="space-y-2 mb-4 bg-zinc-950/40 rounded-lg p-3 border border-zinc-800/60">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Langkah-langkah:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-300">
              {plan.steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-medium text-zinc-200">{step.description}</span>
                  {step.estimatedFiles && step.estimatedFiles.length > 0 && (
                    <span className="text-zinc-500 ml-1">
                      ({step.estimatedFiles.join(', ')})
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-indigo-900/30 text-xs text-zinc-400">
          <span>
            Estimasi: <strong className="text-zinc-200">{plan.estimatedFileCount ?? plan.steps?.length ?? 1} file</strong> akan dibuat/diubah
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction('reject')}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
            >
              Batalkan
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleAction('approve')}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
            >
              {isPending ? 'Memproses...' : 'Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
