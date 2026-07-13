import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Account = {
  id: string;
  name: string | null;
  email: string;
  password_hash: string;
  role: string | null;
  tenant_id: string | null;
  is_active: boolean | null;
};

async function findAccountByEmail(email: string): Promise<Account | null> {
  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("id, name, email, password_hash, role, tenant_id, is_active")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as Account;
}

async function updateLastLogin(accountId: string) {
  try {
    await supabaseAdmin
      .from("accounts")
      .update({ last_login: new Date().toISOString() })
      .eq("id", accountId);
  } catch {
    /* non-critical */
  }
}

interface CutzUser extends User {
  role: string;
  tenantId: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "E-Mail",   type: "email"    },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials): Promise<CutzUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        // Demo account — funktioniert ohne DB-Setup
        if (
          credentials.email === "demo@cutzsolution.com" &&
          credentials.password === "demo123"
        ) {
          return {
            id:       "demo",
            name:     "Demo Owner",
            email:    "demo@cutzsolution.com",
            role:     "owner",
            tenantId: "demo",
          };
        }

        const account = await findAccountByEmail(credentials.email);
        if (!account) return null;
        if (account.is_active === false) return null;

        const valid = await bcrypt.compare(credentials.password, account.password_hash);
        if (!valid) return null;

        void updateLastLogin(account.id);

        return {
          id:       account.id,
          name:     account.name ?? account.email,
          email:    account.email,
          role:     account.role      ?? "owner",
          tenantId: account.tenant_id ?? "",
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as CutzUser;
        token.role     = u.role;
        token.tenantId = u.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as CutzUser).role     = token.role     as string;
        (session.user as CutzUser).tenantId = token.tenantId as string;
        (session.user as CutzUser).id       = token.sub      as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Type augmentation so session.user has role + tenantId
declare module "next-auth" {
  interface Session {
    user: CutzUser;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    role?:     string;
    tenantId?: string;
  }
}
