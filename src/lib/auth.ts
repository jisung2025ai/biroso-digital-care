import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@broso.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = getDb();
        let user = null;

        try {
          user = await db.user.findUnique({
            where: { email: credentials.email }
          });
        } catch (e) {
          console.error("[Auth] DB findUnique error:", e);
        }

        // DB에 계정이 없고 admin@broso.com으로 로그인 시도 시 자동 생성
        if (!user && credentials.email === "admin@broso.com" && credentials.password === "password123") {
          try {
            user = await db.user.create({
              data: {
                email: "admin@broso.com",
                password: "password123",
                name: "최고관리자",
                role: "ADMIN",
              }
            });
            console.log("[Auth] Default admin account auto-created.");
          } catch (e) {
            console.error("[Auth] Failed to auto-create admin:", e);
          }
        }

        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      // 세션 업데이트 시 토큰 갱신 로직 (선택 사항)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일 세션 유지
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
};
