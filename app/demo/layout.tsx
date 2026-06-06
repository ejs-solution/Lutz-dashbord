import { ShowroomProvider } from "@/lib/showroom-context";
import type { ReactNode } from "react";

/** All /demo/* routes are wrapped in ShowroomProvider — no auth, always demo data. */
export default function DemoLayout({ children }: { children: ReactNode }) {
  return <ShowroomProvider>{children}</ShowroomProvider>;
}
