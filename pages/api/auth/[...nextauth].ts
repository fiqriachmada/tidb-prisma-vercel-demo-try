import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import prisma from 'lib/prisma';
import { loginSchema } from 'types/auth';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Validate input shape with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Look up user in DB
        // NOTE: types below show stale until `prisma generate` is run after migration
        const user = await (prisma.user.findUnique as any)({
          where: { email },
        }) as {
          id: number;
          nickname: string;
          name: string | null;
          email: string | null;
          passwordHash: string | null;
          role: string;
        } | null;

        if (!user || !user.passwordHash) return null;

        // 3. Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        // 4. Return minimal user object for the JWT
        return {
          id: String(user.id),
          name: user.name ?? user.nickname,
          email: user.email ?? '',
          role: user.role,
          image: null,
        } as any;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/', // use modal — no dedicated page
  },

  secret: process.env.NEXTAUTH_SECRET ?? 'bookstore-dev-secret-change-me',
};

export default NextAuth(authOptions);
