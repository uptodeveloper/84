"use client";

import { useSession } from "@/store/session";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function MemberOnlyLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) router.replace("/sign-in");
  }, [router, session]);

  if (!session) return null;
  return children;
}
