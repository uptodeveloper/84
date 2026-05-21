import GlobalLayout from "@/components/layout/global-layout";
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <GlobalLayout>{children}</GlobalLayout>;
}
