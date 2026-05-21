"use client";

import { useSession } from "@/store/session";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function GuestOnlyLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/");
  }, [router, session]);

  if (session) return null;
  return children;
}
