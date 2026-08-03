"use client";

import { useQuery } from "@tanstack/react-query";
import { viewerQueryKey, type Viewer } from "./viewer-query";

export { viewerQueryKey, type Viewer } from "./viewer-query";

async function getViewer(): Promise<Viewer> {
  const response = await fetch("/api/auth/me", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("현재 사용자 정보를 확인하지 못했습니다.");
  }

  return response.json() as Promise<Viewer>;
}

export function useViewer() {
  // 인증 정보의 기준은 서버 쿠키이며, 이 query는 헤더와 상품 UI가 최소 userId만 공유하기 위한 용도입니다.
  return useQuery({
    queryKey: viewerQueryKey,
    queryFn: getViewer,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
