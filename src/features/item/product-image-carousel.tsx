"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductImageCarouselProps {
  images: string[];
  title: string;
}

export default function ProductImageCarousel({
  images,
  title,
}: ProductImageCarouselProps) {
  return (
    <Carousel className="w-full h-full">
      <CarouselContent className="h-full ml-0">
        {images.map((imgUrl, index) => (
          <CarouselItem
            key={imgUrl}
            className="pl-0 w-full flex items-center justify-center bg-black/5"
          >
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src={imgUrl}
                alt={`${title} 이미지 ${index + 1}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
                priority={index === 0}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
