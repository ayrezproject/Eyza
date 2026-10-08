import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { createProject } from '@/app/actions/projects'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create New Project — EYZA',
}

export default async function NewProjectPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  return (
    <div className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar user={session.user} />

      <main className="flex-1 mx-auto max-w-2xl w-full p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Buat Project Baru</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Hubungkan atau inisiasi ruang kerja aplikasi Anda untuk dikerjakan bersama EYZA.
          </p>
        </div>

        <form
          action={createProject}
          className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-200">
              Nama Project <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Contoh: pos-retail-app"
              className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-200">
              Deskripsi Singkat
            </label>
            <textarea
              name="description"
              id="description"
              rows={2}
              placeholder="Aplikasi kasir minimarket berbasis web..."
              className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="framework" className="block text-sm font-medium text-zinc-200">
              Framework Target
            </label>
            <select
              name="framework"
              id="framework"
              defaultValue="nextjs"
              className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="nextjs">Next.js (App Router)</option>
              <option value="react">React (Vite / SPA)</option>
              <option value="nodejs">Node.js (Backend / API)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200">Hubungkan GitHub Repository (Opsional)</h3>
            <p className="mt-1 text-xs text-zinc-400 mb-4">
              Jika repository sudah ada di akun GitHub Anda, masukkan nama pemilik dan nama repo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="repoOwner" className="block text-xs font-medium text-zinc-400">
                  Owner / Organisasi
                </label>
                <input
                  type="text"
                  name="repoOwner"
                  id="repoOwner"
                  placeholder="ayrez"
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="repoName" className="block text-xs font-medium text-zinc-400">
                  Nama Repository
                </label>
                <input
                  type="text"
                  name="repoName"
                  id="repoName"
                  placeholder="my-cool-app"
                  className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
            >
              Buat Project
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
