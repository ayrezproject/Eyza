import { signIn } from '@/lib/auth'

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">EYZA</h1>
          <p className="mt-2 text-sm text-zinc-400">Electronic Yielding Zone Assistant</p>
          <p className="mt-1 text-xs text-zinc-600">AI Coding Agent</p>
        </div>

        {/* Sign in card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          <h2 className="mb-6 text-lg font-semibold text-zinc-100">Sign in to continue</h2>

          <form
            action={async () => {
              'use server'
              await signIn('github', { redirectTo: '/dashboard' })
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {/* GitHub icon */}
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-600">
            EYZA requests only necessary GitHub permissions.
          </p>
        </div>
      </div>
    </main>
  )
}
