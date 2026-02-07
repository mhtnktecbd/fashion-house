import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
// import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { defaultFeatures, getFeatures } from "./features";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

export const authOptions = {
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            })
        ] : []),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Feature Flag Check
                const features = await getFeatures();
                if (!features.account_system || !features.email_login) {
                    throw new Error("Login disabled");
                }

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const email = credentials.email.toLowerCase();
                const isAdmin = ADMIN_EMAILS.includes(email);

                console.log(`[AUTH] Authorizing user: ${email}, isAdmin: ${isAdmin}`);

                // Mock Auth for Demo
                if (credentials.password === "password") {
                    return {
                        id: email === "admin@example.com" ? "1" : "2",
                        name: isAdmin ? "Admin User" : "Regular User",
                        email: email,
                        role: isAdmin ? "ADMIN" : "USER"
                    };
                }

                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role || (ADMIN_EMAILS.includes(user.email?.toLowerCase()) ? "ADMIN" : "USER");
                token.id = user.id;
                console.log(`[AUTH] Role assigned in JWT: ${token.role} for ${user.email}`);
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            const email = user.email?.toLowerCase();
            const isAdmin = ADMIN_EMAILS.includes(email);

            // If they are trying to log in via Google, we still check the allowlist for the role
            if (account.provider === "google") {
                user.role = isAdmin ? "ADMIN" : "USER";
            }

            return true;
        }
    },
    pages: {
        signIn: '/auth/signin',
    }
};
