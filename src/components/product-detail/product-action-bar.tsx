import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/types";

interface ProductActionBarProps {
  isMobile?: boolean;
  isMyProduct: boolean;
  isLiked: boolean;
  status: ProductStatus;
  onLike: () => void;
  onChat: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangeStatus: (status: ProductStatus) => void;
}

export default function ProductActionBar({
  isMobile = false,
  isMyProduct,
  isLiked,
  status,
  onLike,
  onChat,
  onEdit,
  onDelete,
  onChangeStatus,
}: ProductActionBarProps) {
  const ownerActionClassName = isMobile
    ? "font-bold"
    : "flex-1 font-bold";

  const wrapperClassName = isMobile
    ? "flex justify-center gap-3"
    : "hidden md:flex gap-3 mt-8";

  if (isMyProduct) {
    return (
      <div className={wrapperClassName}>
        {status === "SOLD_OUT" ? (
          <Button
            onClick={() => onChangeStatus("FOR_SALE")}
            className={`${ownerActionClassName} bg-green-600 hover:bg-green-700`}
          >
            판매중으로 변경
          </Button>
        ) : (
          <Button
            onClick={() => onChangeStatus("SOLD_OUT")}
            className={`${ownerActionClassName} bg-gray-800 hover:bg-black`}
          >
            판매 완료 처리
          </Button>
        )}

        <Button variant="outline" onClick={onEdit}>
          수정
        </Button>
        <Button variant="destructive" onClick={onDelete}>
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
        disabled={!isMobile && status === "SOLD_OUT"}
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
            ? "거래가 완료된 상품입니다."
            : "채팅하기"}
      </Button>
    </div>
  );
}
