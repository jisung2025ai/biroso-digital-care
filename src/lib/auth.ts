import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
            const hashed = await bcrypt.hash("password123", 10);
            user = await db.user.create({
              data: {
                email: "admin@broso.com",
                password: hashed,
                name: "최고관리자",
                role: "ADMIN",
              }
            });
            console.log("[Auth] Default admin account auto-created (bcrypt).");
          } catch (e) {
            console.error("[Auth] Failed to auto-create admin:", e);
          }
        }

        if (!user) return null;

        // bcrypt 검증 (해싱된 비밀번호)
        const isValidBcrypt = await bcrypt.compare(credentials.password, user.password).catch(() => false);
        
        // 평문 호환성 (기존 계정 마이그레이션)
        const isValidPlain = !isValidBcrypt && user.password === credentials.password;

        if (isValidBcrypt || isValidPlain) {
          // 평문이었다면 이번 로그인 시 자동으로 bcrypt 해시로 업그레이드
          if (isValidPlain) {
            try {
              const hashed = await bcrypt.hash(credentials.password, 10);
              await db.user.update({ where: { id: user.id }, data: { password: hashed } });
              console.log(`[Auth] Migrated password to bcrypt for: ${user.email}`);
            } catch (e) {
              console.error("[Auth] Password migration failed:", e);
            }
          }
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
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only",
};
