import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Contoh validasi manual (ganti dengan database kamu)
        const user = {
          id: "1",
          name: "Admin IPNU",
          email: "admin@ipnu.test",
        };

        if (
          credentials?.email === "admin@ipnu.test" &&
          credentials?.password === "admin123"
        ) {
          return user;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // redirect custom page login
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
