"use client";

import GlobalLoader from "@/components/global-loader";
import supabase from "@/lib/supabase";
import { useIsSeesionLoaded, useSetSession } from "@/store/session";
import { useEffect, type ReactNode } from "react";

export default function SessionProvider({ children }: { children: ReactNode }) {
  const setSession = useSetSession();
  const isSessionLoaded = useIsSeesionLoaded();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  if (!isSessionLoaded) return <GlobalLoader />;

  return children;
}
