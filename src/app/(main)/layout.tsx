import GlobalLayout from "@/components/layout/global-layout";
import { getCurrentUserId } from "@/features/auth/server-auth";
import { viewerQueryKey } from "@/features/auth/viewer-query";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  const userId = await getCurrentUserId();

  // 헤더가 브라우저 요청을 기다리며 깜빡이지 않도록 서버가 확인한 viewer를 첫 렌더에 전달합니다.
  queryClient.setQueryData(viewerQueryKey, { userId });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GlobalLayout>{children}</GlobalLayout>
    </HydrationBoundary>
  );
}
