import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@eyza/database'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request minimal scopes per PRD Section 12
          scope: 'read:user user:email repo workflow',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider !== 'github' || !profile) return false

      const githubProfile = profile as unknown as {
        id: number
        login: string
        avatar_url: string
        email: string | null
        name: string | null
      }

      // Upsert user on every login
      await prisma.user.upsert({
        where: { githubId: String(githubProfile.id) },
        create: {
          email: user.email ?? `${githubProfile.login}@users.noreply.github.com`,
          name: githubProfile.name,
          avatarUrl: githubProfile.avatar_url,
          githubId: String(githubProfile.id),
          githubUsername: githubProfile.login,
          githubToken: account.access_token ?? null,
        },
        update: {
          name: githubProfile.name,
          avatarUrl: githubProfile.avatar_url,
          githubUsername: githubProfile.login,
          githubToken: account.access_token ?? null,
        },
      })

      return true
    },

    async session({ session, token }) {
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { githubId: token.sub },
          select: { id: true, githubUsername: true, avatarUrl: true },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          // @ts-expect-error — extended session type
          session.user.githubUsername = dbUser.githubUsername
        }
      }
      return session
    },

    async jwt({ token, profile }) {
      if (profile) {
        const githubProfile = profile as unknown as { id: number }
        token.sub = String(githubProfile.id)
      }
      return token
    },

  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
