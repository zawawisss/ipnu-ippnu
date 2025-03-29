import db from "@/lib/db";
import Admin from "@/models/Admin";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const handler =NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials:{
                username: { label: "Username", type: "username"},
                password: { label: "Password", type: "password"}
            },
            authorize: async(credentials)=> {
                await db();
                const user = await Admin.findOne({username: credentials?.username});
                if (!user) throw new Error("Anda Bukan Admin");

                const isPasswordCorrect = await bcrypt.compare(
                    credentials?.password ?? "",
                    user.password
                );

                if (!isPasswordCorrect) throw new Error ("Password mungkin Typo");

                return{
                    id : user._id,
                    username : user.username,
                    role : user.role, 
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn : "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST};