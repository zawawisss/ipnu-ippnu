import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./lib/db";
import Admin from "./models/Admin";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Attempting to authorize with credentials:", credentials);
        console.log("Username provided in credentials:", credentials?.username);
        await connectDB();
        console.log("Database connected.");

        const admin = await Admin.findOne({ username: credentials?.username });
        console.log("Admin found:", admin);
        console.log("Provided password:", credentials?.password);
        console.log("Admin password from DB:", admin?.password);

        const passwordMatch = admin && (await bcrypt.compare(credentials?.password || "", admin.password));
        console.log("Password match result:", passwordMatch);

        if (passwordMatch) {
          console.log("Password matches. Authorization successful.");
          // Construct the name in the format expected by the layout checks
          const [org, role] = admin.username.split('_');
          const authorizedUser = {
            id: admin._id,
            name: `${org}_${role}`,
            role: admin.role,
          };
          console.log("Authorized user object:", authorizedUser);
          return authorizedUser;
        }

        console.log("Authorization failed.");

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
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id; // Add user ID to token
        token.role = user.role;
        token.name = user.name; // Add name to token
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.sub; // Add user ID from token to session
        session.user.role = token.role;
        session.user.name = token.name; // Add name to session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
