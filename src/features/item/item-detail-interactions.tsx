"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { findChatRoomAction } from "@/features/chat/server-actions";
import { useProductLike } from "@/hooks/queries/like/use-item-like";
import { useSession } from "@/store/session";
import type { ProductStatus } from "@/types";
import { deleteItemAction, updateItemStatusAction } from "./server-actions";
import ProductActionSection from "./product-action-section";

interface ItemDetailInteractionsProps {
  productId: string;
  sellerId: string | null;
  status: ProductStatus;
  isMobile?: boolean;
}

export default function ItemDetailInteractions({
  productId,
  sellerId,
  status,
  isMobile = false,
}: ItemDetailInteractionsProps) {
  const router = useRouter();
  const session = useSession();
  const userId = session?.user?.id ?? null;
  const [isPending, startTransition] = useTransition();

  const { isLiked, toggleLike } = useProductLike(productId, userId);
  const isMyProduct = !!sellerId && session?.user?.id === sellerId;

  const handleLike = () => {
    if (!userId) {
      return toast.error("로그인이 필요합니다.");
    }

    toggleLike();
  };

  const handleDelete = () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    startTransition(async () => {
      try {
        await deleteItemAction({ id: productId });
        toast.success("삭제되었습니다.");
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    });
  };

  const handleEdit = () => {
    router.push(`/item/edit/${productId}`);
  };

  const handleChangeStatus = (nextStatus: ProductStatus) => {
    startTransition(async () => {
      try {
        await updateItemStatusAction({ id: productId, status: nextStatus });
        toast.success("상태가 변경되었습니다.");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("상태 변경에 실패했습니다.");
      }
    });
  };

  const handleChatClick = async () => {
    if (!session?.user) return toast.error("로그인이 필요합니다.");
    if (!sellerId) return;
    if (session.user.id === sellerId) {
      return toast.error("본인 상품과는 채팅할 수 없습니다.");
    }

    try {
      // buyer/seller 판정은 클라이언트 값을 믿지 않고 서버 액션에서 다시 확인합니다.
      const existingRoomId = await findChatRoomAction({ productId });

      if (existingRoomId) {
        router.push(`/chat/${existingRoomId}`);
        return;
      }

      router.push(`/chat/new?productId=${productId}`);
    } catch (error) {
      console.error(error);
      toast.error("채팅방 연결 중 오류가 발생했습니다.");
    }
  };

  return (
    <ProductActionSection
      isMobile={isMobile}
      isMyProduct={isMyProduct}
      isLiked={isLiked}
      status={status}
      isPending={isPending}
      onLike={handleLike}
      onChat={handleChatClick}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onChangeStatus={handleChangeStatus}
    />
  );
}
