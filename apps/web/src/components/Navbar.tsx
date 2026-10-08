import { signOut } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    githubUsername?: string | null
  }
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-black text-white text-base">
              E
            </span>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white leading-none">EYZA</span>
              <span className="text-[10px] text-zinc-500 font-mono">v1.1</span>
            </div>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/projects/new"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              + New Project
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name ?? 'Avatar'}
                  width={32}
                  height={32}
                  className="rounded-full ring-1 ring-zinc-700"
                />
              )}
              <span className="text-xs text-zinc-300 hidden sm:inline">
                {user.name ?? user.githubUsername}
              </span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-zinc-800 bg-zinc-800/60 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
