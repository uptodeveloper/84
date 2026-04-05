import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateItemStatus } from "@/api/item";
import type { Product, ProductStatus } from "@/types";
import { toast } from "sonner";

export function useUpdateItemStatus(itemId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["products", "list"];
  const detailKey = ["products", "detail", itemId];
  type ProductListData = InfiniteData<Product[]>;

  return useMutation({
    mutationFn: (newStatus: ProductStatus) =>
      updateItemStatus(itemId, newStatus),

    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previousData = queryClient.getQueryData(queryKey);
      const prevDetail = queryClient.getQueryData(detailKey);

      queryClient.setQueriesData<ProductListData>({ queryKey }, (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((item) =>
              item.id === itemId ? { ...item, status: newStatus } : item,
            ),
          ),
        };
      });

      queryClient.setQueryData<Product>(detailKey, (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, status: newStatus };
      });

      return { previousData, prevDetail };
    },

    onError: (_err, _newStatus, context) => {
      toast.error("상태 변경에 실패했습니다. 되돌립니다.");
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.prevDetail) {
        queryClient.setQueryData(detailKey, context.prevDetail);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      queryClient.invalidateQueries({ queryKey: ["likedItems"] });
    },

    onSuccess: () => {
      toast.success("상태가 변경되었습니다.");
    },
  });
}
