import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateItemStatus } from "@/api/item";
import { toast } from "sonner";

export function useUpdateItemStatus(itemId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["products", "list"]; // 메인 화면 키
  const detailKey = ["products", "detail", itemId];

  return useMutation({
    mutationFn: (newStatus: "FOR_SALE" | "SOLD_OUT") =>
      updateItemStatus(itemId, newStatus),

    // 🟢 1. [핵심] 서버 요청 보내기 직전에 실행 (onMutate)
    onMutate: async (newStatus) => {
      // 1-1. 진행 중인 리패치 취소 (데이터 꼬임 방지)
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: detailKey });

      // 1-2. 이전 데이터 스냅샷 찍기 (에러 나면 복구용)
      const previousData = queryClient.getQueryData(queryKey);
      const prevDetail = queryClient.getQueryData(detailKey);

      // 1-3. 캐시 데이터 직접 수정 (화면 즉시 반영!)
      queryClient.setQueriesData({ queryKey }, (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((item) =>
              item.id === itemId
                ? { ...item, status: newStatus } // 타겟 아이템만 상태 변경
                : item,
            ),
          ),
        };
      });
      // 4. 🟢 [상세 페이지] 가짜 업데이트 (이게 없어서 안 됐던 것!)
      // 상세 페이지 캐시가 있으면, status만 쏙 바꿔치기
      queryClient.setQueryData(detailKey, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, status: newStatus };
      });

      // 1-4. 에러 났을 때 쓸 스냅샷 리턴
      return { previousData, prevDetail };
    },

    // 🟢 2. 에러 발생 시 롤백 (onError)
    onError: (_err, _newStatus, context) => {
      toast.error("상태 변경에 실패했습니다. 되돌립니다.");
      // onMutate에서 리턴한 previousData로 덮어쓰기
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.prevDetail) {
        queryClient.setQueryData(detailKey, context.prevDetail);
      }
    },

    // 🟢 3. 성공하든 실패하든 끝난 후 (onSettled)
    onSettled: () => {
      // 혹시 데이터가 안 맞을 수 있으니 서버랑 최신화 (Invalidate)
      // 마이페이지, 찜목록, 상세페이지 등 관련된 거 싹 다 갱신 예약
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      queryClient.invalidateQueries({ queryKey: ["likedItems"] });
    },

    onSuccess: () => {
      toast.success("상태가 변경되었습니다.");
    },
  });
}
