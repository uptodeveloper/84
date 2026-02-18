import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { deleteItem, getItem } from "@/api/item";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Heart } from "lucide-react";
import { useSession } from "@/store/session";
import { checkChatRoom } from "@/api/chat";
import { toast } from "sonner";
import { useProductLike } from "@/hooks/queries/like/use-item-like";
import { useUpdateItemStatus } from "@/hooks/mutations/item/use-update-status";

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const session = useSession(); // 로그인 정보
  const { mutate: updateStatus } = useUpdateItemStatus(itemId as string); // 👈 훅 사용

  // 🟢 [추가] 찜 훅 사용 (itemId와 userId 전달)
  const userId = session?.user?.id || null;
  const { isLiked, toggleLike } = useProductLike(itemId as string, userId);
  // 🟢 [추가] 찜 버튼 클릭 핸들러
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // 버블링 방지
    if (!userId) {
      return toast.error("로그인이 필요합니다."); // sonner 토스트 사용
    }
    toggleLike();
  };

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", "detail", itemId],
    queryFn: () => getItem(itemId as string),
    enabled: !!itemId,
  });

  // 1. 내 글인지 확인 (안전하게 ?. 사용)
  // product나 session이 로딩 중일 때도 에러 안 나게 처리
  const isMyProduct =
    product?.seller_id && session?.user?.id === product.seller_id;

  // 2. 삭제 핸들러
  const handleDelete = async () => {
    // 🛡️ 안전장치: 상품 정보가 없으면 실행 중단
    if (!product) return;

    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteItem(product.id); // 삭제 API 호출
        alert("삭제되었습니다.");
        navigate("/"); // 홈으로 이동
      } catch (error) {
        console.error(error);
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 3. 수정 핸들러
  const handleEdit = () => {
    if (!product) return;
    navigate(`/item/edit/${product.id}`); // 수정 페이지로 이동
  };

  // 4. 채팅하기 버튼 핸들러
  const handleChatClick = async () => {
    if (!session?.user) return toast.error("로그인이 필요합니다.");
    if (!product || !product.seller_id) return;
    if (session.user.id === product.seller_id) {
      return toast.error("본인 상품에는 채팅할 수 없습니다.");
    }

    try {
      // 이미 존재하는 방이 있는지 먼저 확인
      const existingRoomId = await checkChatRoom({
        product_id: product.id,
        buyer_id: session.user.id,
        seller_id: product.seller_id,
      });

      if (existingRoomId) {
        // 방이 있으면 거기로 이동
        navigate(`/chat/${existingRoomId}`);
      } else {
        // 방이 없으면 DB 만들지 말고 '가짜 방'으로 이동
        navigate(
          `/chat/new?productId=${product.id}&sellerId=${product.seller_id}`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("채팅방 연결 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 이미지 스켈레톤 */}
          <div className="flex flex-col gap-4">
            <div className="relative w-full aspect-square bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>

          {/* 텍스트 스켈레톤 */}
          <div className="flex flex-col gap-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
            <hr className="border-gray-100 my-6" />
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse mt-auto" />
          </div>
        </div>
        {/* 설명 스켈레톤 */}
        <div className="h-40 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }
  if (isError || !product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* [왼쪽] 1. 이미지 영역 */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden border">
            {product.image && product.image.length > 0 ? (
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full ml-0">
                  {product.image.map((imgUrl: string, index: number) => (
                    <CarouselItem
                      key={index}
                      className="pl-0 w-full flex items-center justify-center bg-black/5"
                    >
                      <img
                        src={imgUrl}
                        alt={product.title}
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                이미지 없음
              </div>
            )}
          </div>
          {/* 판매자 정보 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <p className="font-medium text-sm">
                  판매자: {product.seller_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* [오른쪽] 2. 상품 핵심 정보 영역 */}
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold leading-tight break-keep">
              {product.title}
            </h1>

            <p className="text-2xl font-bold text-orange-600">
              {Number(product.price).toLocaleString()}원
            </p>

            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                {product.category || "기타"}
              </span>
              {/* <span>·</span>
              <span>1분 전</span> */}
            </div>

            <hr className="border-gray-100 my-6" />

            {/* 판매 상태 표시 */}
            <div className="flex items-center justify-between">
              {product.status === "SOLD_OUT" && (
                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                  판매완료
                </span>
              )}
            </div>
          </div>

          {/* PC용 버튼 영역 */}
          <div className="hidden md:flex gap-3 mt-8">
            {isMyProduct ? (
              // 🟢 주인일 때: 수정 / 삭제
              <>
                {/* 상태 변경 셀렉트 박스 (간단하게 버튼으로 구현) */}
                {product.status === "SOLD_OUT" ? (
                  <Button
                    onClick={() => updateStatus("FOR_SALE")}
                    className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                  >
                    판매중으로 변경
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateStatus("SOLD_OUT")}
                    className="flex-1 bg-gray-800 hover:bg-black font-bold"
                  >
                    판매 완료 처리
                  </Button>
                )}

                <Button variant="outline" onClick={handleEdit}>
                  수정
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  삭제
                </Button>
              </>
            ) : (
              // 🔵 손님일 때: 찜 / 채팅
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-14 px-0"
                  onClick={handleLike} // 👈 클릭 이벤트 연결
                >
                  {/* 찜 상태에 따라 빨간색 채우기 */}
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </Button>
                <Button
                  onClick={handleChatClick}
                  size="lg"
                  disabled={product.status === "SOLD_OUT"} // 👈 버튼 잠금
                  className={`flex-1 font-bold text-lg ${
                    product.status === "SOLD_OUT"
                      ? "bg-gray-300 cursor-not-allowed text-gray-500" // 회색 처리
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {product.status === "SOLD_OUT"
                    ? "거래가 완료된 상품입니다"
                    : "채팅하기"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* [하단] 3. 상세 설명 */}
      <section className="border-t pt-10">
        <h3 className="font-bold text-lg mb-4">상품 정보</h3>
        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed min-h-[200px]">
          {product.description}
        </p>
      </section>

      {/* [모바일 전용] 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden z-50">
        <div className="flex justify-center  gap-3">
          {isMyProduct ? (
            // 🟢 주인일 때: 수정 / 삭제
            <>
              {/* 상태 변경 셀렉트 박스 (간단하게 버튼으로 구현) */}
              {product.status === "SOLD_OUT" ? (
                <Button
                  onClick={() => updateStatus("FOR_SALE")}
                  className=" bg-green-600 hover:bg-green-700 font-bold"
                >
                  판매중으로 변경
                </Button>
              ) : (
                <Button
                  onClick={() => updateStatus("SOLD_OUT")}
                  className=" bg-gray-800 hover:bg-black font-bold"
                >
                  판매 완료 처리
                </Button>
              )}

              <Button variant="outline" onClick={handleEdit}>
                수정
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                삭제
              </Button>
            </>
          ) : (
            // 🔵 손님일 때 (모바일)
            <>
              <Button
                variant="outline"
                className="w-14 px-0" // w-12 -> w-14로 통일
                onClick={handleLike} // 👈 클릭 이벤트 연결
              >
                {/* PC와 동일한 로직 적용 */}
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </Button>
              <Button
                onClick={handleChatClick}
                className="flex-1 bg-orange-500 font-bold"
              >
                채팅으로 거래하기
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
