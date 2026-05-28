import Image from "next/image";
import ProductImageCarousel from "./product-image-carousel";

interface ProductMediaSectionProps {
  images: string[] | null;
  title: string;
  sellerId: string | null;
}

export default function ProductMediaSection({
  images,
  title,
  sellerId,
}: ProductMediaSectionProps) {
  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden border">
        {!hasImages && (
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            이미지 없음
          </div>
        )}

        {hasImages && images.length === 1 && (
          <div className="relative w-full h-[400px] md:h-[500px] bg-black/5">
            <Image
              src={images[0]}
              alt={title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
              priority
            />
          </div>
        )}

        {hasImages && images.length > 1 && (
          <ProductImageCarousel images={images} title={title} />
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div>
            <p className="font-medium text-sm">판매자: {sellerId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
