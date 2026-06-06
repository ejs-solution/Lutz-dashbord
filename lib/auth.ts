import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const AIRTABLE_KEY  = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!;

type AirtableAccount = {
  id: string;
  Name: string;
  Email: string;
  PasswordHash: string;
  Role?: string;
  TenantId?: string;
  IsActive?: boolean;
};

async function findAccountByEmail(email: string): Promise<AirtableAccount | null> {
  try {
    const filter = encodeURIComponent(`{Email}="${email}"`);
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Accounts?filterByFormula=${filter}&maxRecords=1`,
      { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json() as { records: { id: string; fields: Record<string, unknown> }[] };
    const record = data.records?.[0];
    if (!record) return null;
    return { id: record.id, ...(record.fields as Omit<AirtableAccount, "id">) };
  } catch {
    return null;
  }
}

async function updateLastLogin(accountId: string) {
  try {
    await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Accounts/${accountId}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { LastLogin: new Date().toISOString() } }),
      }
    );
  } catch { /* non-critical */ }
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

        // Demo account — works without Airtable setup
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
        if (account.IsActive === false) return null;

        const valid = await bcrypt.compare(credentials.password, account.PasswordHash);
        if (!valid) return null;

        void updateLastLogin(account.id);

        return {
          id:       account.id,
          name:     account.Name,
          email:    account.Email,
          role:     account.Role     ?? "owner",
          tenantId: account.TenantId ?? "",
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
