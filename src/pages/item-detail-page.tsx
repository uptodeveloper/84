import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getItem } from "@/api/item";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import GlobalLoader from "@/components/global-loader";
import { Heart } from "lucide-react"; // 하트 아이콘 추가
import { useSession } from "@/store/session";
import { checkChatRoom, enterChatRoom } from "@/api/chat";
import { toast } from "sonner";

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const session = useSession(); // 로그인 정보

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", itemId],
    queryFn: () => getItem(itemId as string),
    enabled: !!itemId,
  });

  // // 채팅방 입장 Mutation
  // const { mutate: startChat, isPending: isStartingChat } = useMutation({
  //   mutationFn: enterChatRoom,
  //   onSuccess: (roomId) => {
  //     // 성공하면 채팅 페이지로 이동 (방 번호 들고 감)
  //     navigate(`/chat/${roomId}`);
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //     toast.error("채팅방 입장에 실패했습니다.");
  //   },
  // });

  // 2. 수정: 채팅하기 버튼 핸들러
  const handleChatClick = async () => {
    if (!session?.user) return toast.error("로그인이 필요합니다.");
    if (!product || !product.seller_id) return;
    if (session.user.id === product.seller_id) {
      return toast.error("본인 상품에는 채팅할 수 없습니다.");
    }

    try {
      // 3. 이미 존재하는 방이 있는지 먼저 확인
      const existingRoomId = await checkChatRoom({
        product_id: product.id,
        buyer_id: session.user.id,
        seller_id: product.seller_id,
      });

      if (existingRoomId) {
        // 방이 있으면 거기로 이동
        navigate(`/chat/${existingRoomId}`);
      } else {
        // ⭐ 핵심: 방이 없으면 DB 만들지 말고 '가짜 방'으로 이동
        // 정보를 쿼리 파라미터로 다 넘깁니다.
        navigate(
          `/chat/new?productId=${product.id}&sellerId=${product.seller_id}`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("채팅방 연결 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) return <GlobalLoader />;
  if (isError || !product) return <div>상품을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* ⭐ 핵심 변경: PC에서는 2열(grid-cols-2), 모바일은 1열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* [왼쪽] 1. 이미지 영역 */}
        <div className="flex flex-col gap-4">
          {" "}
          {/* 이미지와 판매자 사이 간격 */}
          <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden border">
            {product.image && product.image.length > 0 ? (
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full ml-0">
                  {product.image.map((imgUrl: string, index: number) => (
                    // aspect-auto로 변경하신 부분 유지!
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
          {/* 2. 🚚 판매자 정보 (여기로 이사 왔습니다!) */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg ">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <p className="font-medium text-sm">
                  판매자: {product.seller_id}
                </p>
                <p className="text-xs text-gray-400">서울시 마포구</p>
              </div>
            </div>
          </div>
        </div>

        {/* [오른쪽] 2. 상품 핵심 정보 영역 (와이어프레임 구조 반영) */}
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-4">
            {/* 제목 */}
            <h1 className="text-3xl font-bold leading-tight break-keep">
              {product.title}
            </h1>

            {/* 가격 */}
            <p className="text-2xl font-bold text-orange-600">
              {Number(product.price).toLocaleString()}원
            </p>
            {/* 카테고리 & 시간 */}
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                {product.category || "기타"}
              </span>
              <span>·</span>
              <span>1분 전</span>
            </div>

            <hr className="border-gray-100 my-6" />

            {/* 판매자 & 상태 */}
            <div className="flex items-center justify-between">
              {/* <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <p className="font-medium text-sm">
                    판매자: {product.seller_id}
                  </p>
                  <p className="text-xs text-gray-400">서울시 마포구</p>
                </div>
              </div> */}
              {product.status === "SOLD_OUT" && (
                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                  판매완료
                </span>
              )}
            </div>
          </div>

          {/* PC용 버튼 (모바일 바텀바 말고, 와이어프레임처럼 옆에 두기) */}
          <div className="hidden md:flex gap-3 mt-8">
            <Button variant="outline" size="lg" className="w-14 px-0">
              <Heart className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleChatClick}
              // disabled={isStartingChat}
              size="lg"
              className="flex-1 bg-orange-500 hover:bg-orange-600 font-bold text-lg"
            >
              채팅하기
            </Button>
          </div>
        </div>
      </div>

      {/* [하단] 3. 상세 설명 (와이어프레임처럼 아래에 배치) */}
      <section className="border-t pt-10">
        <h3 className="font-bold text-lg mb-4">상품 정보</h3>
        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed min-h-[200px]">
          {product.description}
        </p>
      </section>

      {/* [모바일 전용] 하단 고정 버튼 (PC에선 숨김: md:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden z-50">
        <div className="flex gap-3">
          <Button variant="outline" className="w-12">
            ♥
          </Button>
          <Button
            onClick={handleChatClick}
            // disabled={isStartingChat}
            className="flex-1 bg-orange-500 font-bold"
          >
            채팅으로 거래하기
          </Button>
        </div>
      </div>
    </div>
  );
}
