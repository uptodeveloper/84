"use client";

import { useQuery } from "@tanstack/react-query";
import { checkChatRoom } from "@/api/chat";
import { deleteItem, getItem } from "@/api/item";
import ProductActionSection from "@/components/product-detail/product-action-section";
import ProductInfoSection from "@/components/product-detail/product-info-section";
import ProductMediaSection from "@/components/product-detail/product-media-section";
import { useUpdateItemStatus } from "@/hooks/mutations/item/use-update-status";
import { useProductLike } from "@/hooks/queries/like/use-item-like";
import { useSession } from "@/store/session";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

export default function ItemDetailPage() {
  const params = useParams();
  const itemIdParam = params?.itemId;
  const itemId = Array.isArray(itemIdParam) ? itemIdParam[0] : itemIdParam;
  const router = useRouter();
  const session = useSession();
  const userId = session?.user?.id ?? null;

  const { mutate: updateStatus } = useUpdateItemStatus(itemId as string);
  const { isLiked, toggleLike } = useProductLike(itemId as string, userId);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "detail", itemId],
    queryFn: () => getItem(itemId as string),
    enabled: !!itemId,
  });

  const isMyProduct =
    !!product?.seller_id && session?.user?.id === product.seller_id;
  const productStatus = product?.status ?? "FOR_SALE";

  const handleLike = () => {
    if (!userId) {
      return toast.error("로그인이 필요합니다.");
    }

    toggleLike();
  };

  const handleDelete = async () => {
    if (!product) return;

    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteItem(product.id);
      toast.success("삭제되었습니다.");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    if (!product) return;
    router.push(`/item/edit/${product.id}`);
  };

  const handleChatClick = async () => {
    if (!session?.user) return toast.error("로그인이 필요합니다.");
    if (!product || !product.seller_id) return;
    if (session.user.id === product.seller_id) {
      return toast.error("본인 상품과는 채팅할 수 없습니다.");
    }

    try {
      const existingRoomId = await checkChatRoom({
        product_id: product.id,
        buyer_id: session.user.id,
        seller_id: product.seller_id,
      });

      if (existingRoomId) {
        router.push(`/chat/${existingRoomId}`);
        return;
      }

      router.push(
        `/chat/new?productId=${product.id}&sellerId=${product.seller_id}`,
      );
    } catch (error) {
      console.error(error);
      toast.error("채팅방 연결 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
            <hr className="border-gray-100 my-6" />
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse mt-auto" />
          </div>
        </div>
        <div className="h-40 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ProductMediaSection
          images={product.image}
          title={product.title}
          sellerId={product.seller_id}
        />

        <div className="flex flex-col justify-between h-full">
          <ProductInfoSection product={product} />

          <ProductActionSection
            isMyProduct={isMyProduct}
            isLiked={isLiked}
            status={productStatus}
            onLike={handleLike}
            onChat={handleChatClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeStatus={updateStatus}
          />
        </div>
      </div>

      <section className="border-t pt-10">
        <h3 className="font-bold text-lg mb-4">상품 정보</h3>
        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed min-h-[200px]">
          {product.description}
        </p>
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden z-50">
        <ProductActionSection
          isMobile
          isMyProduct={isMyProduct}
          isLiked={isLiked}
          status={productStatus}
          onLike={handleLike}
          onChat={handleChatClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onChangeStatus={updateStatus}
        />
      </div>
    </div>
  );
}
