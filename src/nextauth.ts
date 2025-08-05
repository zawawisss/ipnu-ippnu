// nextauth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from './lib/db';
import Admin from './models/Admin';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await db();

        const admin = await Admin.findOne({ username: credentials.username });
        if (!admin) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (passwordMatch) {
          const usernameParts = admin.username.split('_');
          const org = usernameParts[0];
          const role = usernameParts.length > 1 ? usernameParts[1] : '';

          return {
            id: admin._id,
            name: `${org}_${role}`,
            role: admin.role,
            org: org,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.org = user.org;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.org = token.org;
        session.user.email = undefined;
        session.user.image = undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
