import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden border">
        {images && images.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full ml-0">
              {images.map((imgUrl, index) => (
                <CarouselItem
                  key={index}
                  className="pl-0 w-full flex items-center justify-center bg-black/5"
                >
                  <img
                    src={imgUrl}
                    alt={title}
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
