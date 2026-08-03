import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/types";

interface ProductActionSectionProps {
  isMobile?: boolean;
  isMyProduct: boolean;
  isLiked: boolean;
  status: ProductStatus;
  isViewerPending?: boolean;
  isPending?: boolean;
  onLike: () => void;
  onChat: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeStatus: (status: ProductStatus) => void;
}

export default function ProductActionSection({
  isMobile = false,
  isMyProduct,
  isLiked,
  status,
  isViewerPending = false,
  isPending = false,
  onLike,
  onChat,
  onEdit,
  onDelete,
  onChangeStatus,
}: ProductActionSectionProps) {
  const ownerActionClassName = isMobile ? "font-bold" : "flex-1 font-bold";

  const wrapperClassName = isMobile
    ? "flex justify-center gap-3"
    : "hidden md:flex gap-3 mt-8";

  // viewer 확인 전에는 비회원용 액션을 노출하지 않고 기존 버튼 영역의 크기만 유지합니다.
  if (isViewerPending) {
    return (
      <div className={wrapperClassName} aria-busy="true" aria-label="사용자 확인 중">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-gray-100" />
      </div>
    );
  }

  if (isMyProduct) {
    return (
      <div className={wrapperClassName}>
        {status === "SOLD_OUT" ? (
          <Button
            onClick={() => onChangeStatus("FOR_SALE")}
            disabled={isPending}
            className={`${ownerActionClassName} bg-green-600 hover:bg-green-700`}
          >
            판매중으로 변경
          </Button>
        ) : (
          <Button
            onClick={() => onChangeStatus("SOLD_OUT")}
            disabled={isPending}
            className={`${ownerActionClassName} bg-gray-800 hover:bg-black`}
          >
            판매 완료 처리
          </Button>
        )}

        <Button variant="outline" onClick={onEdit} disabled={isPending}>
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete} disabled={isPending}>
          삭제
        </Button>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <Button
        variant="outline"
        size={isMobile ? undefined : "lg"}
        className="w-14 px-0"
        onClick={onLike}
        disabled={isPending}
      >
        <Heart
          className={`transition-colors ${
            isMobile ? "w-5 h-5" : "w-6 h-6"
          } ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        />
      </Button>
      <Button
        onClick={onChat}
        size={isMobile ? undefined : "lg"}
        disabled={isPending || (!isMobile && status === "SOLD_OUT")}
        className={
          isMobile
            ? "flex-1 bg-orange-500 font-bold"
            : `flex-1 font-bold text-lg ${
                status === "SOLD_OUT"
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-orange-500 hover:bg-orange-600"
              }`
        }
      >
        {isMobile
          ? "채팅으로 거래하기"
          : status === "SOLD_OUT"
            ? "거래가 완료된 상품입니다"
            : "채팅하기"}
      </Button>
    </div>
  );
}
