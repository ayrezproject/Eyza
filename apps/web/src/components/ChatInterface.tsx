'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { sendMessage, respondToPlan } from '@/app/actions/chat'
import { PlanApprovalCard } from '@/components/PlanApprovalCard'
import type { Message, Task, TaskPlan } from '@eyza/types'

interface ChatInterfaceProps {
  projectId: string
  conversationId: string
  initialMessages: (Message & { createdAt: Date | string })[]
  activeTask?: (Task & { plan: TaskPlan | null }) | null
}

export function ChatInterface({
  projectId,
  conversationId,
  initialMessages,
  activeTask,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isSending, startSendTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [initialMessages, activeTask])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    const currentInput = input
    setInput('')

    startSendTransition(async () => {
      await sendMessage(projectId, conversationId, currentInput)
    })
  }

  const handlePlanAction = async (action: 'approve' | 'reject') => {
    if (!activeTask?.id) return
    await respondToPlan(activeTask.id, action)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] rounded-xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-2xl">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {initialMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold text-xl mb-4">
              E
            </div>
            <h3 className="text-base font-semibold text-white">Mulai bekerja bersama EYZA</h3>
            <p className="mt-1 text-xs max-w-sm text-zinc-400">
              Ketikkan instruksi natural language untuk aplikasi Anda, misalnya: &quot;Buatkan fitur otentikasi login&quot; atau &quot;Perbaiki tampilan navbar&quot;.
            </p>
          </div>
        ) : (
          initialMessages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs">
                    E
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          })
        )}

        {/* Plan confirmation card if active task is awaiting approval */}
        {activeTask && activeTask.state === 'AWAITING_APPROVAL' && activeTask.plan && (
          <div className="my-2">
            <PlanApprovalCard
              taskId={activeTask.id}
              plan={activeTask.plan}
              onAction={handlePlanAction}
            />
          </div>
        )}

        {/* Sending indicator */}
        {isSending && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            EYZA sedang menganalisis instruksi dan menyusun rencana...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="Ketik instruksi untuk EYZA... (tekan Enter untuk mengirim)"
            rows={2}
            disabled={isSending}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-40"
          >
            Kirim
          </button>
        </div>
      </form>
    </div>
  )
}
