import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Tables } from "@/database.types";

interface ItemCardProps {
  item: Tables<"products">;
  action?: ReactNode;
}

export default function ItemCard({ item, action }: ItemCardProps) {
  return (
    <article className="border rounded-lg overflow-hidden hover:shadow-md transition bg-white relative">
      <Link href={`/item/${item.id}`} className="group block">
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {item.image?.[0] ? (
            <Image
              src={item.image[0]}
              alt={item.title}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              이미지 없음
            </div>
          )}

          {item.status === "SOLD_OUT" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg z-20">
              판매완료
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium truncate text-gray-900">{item.title}</h3>
          <p className="font-bold text-lg mt-1">
            {Number(item.price).toLocaleString()}원
          </p>
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-xs px-2 py-1 rounded ${
                item.status === "SOLD_OUT"
                  ? "bg-gray-200 text-gray-500 font-medium"
                  : "bg-green-100 text-green-700 font-medium"
              }`}
            >
              {item.status === "SOLD_OUT" ? "판매완료" : "판매중"}
            </span>
            <span className="text-xs text-gray-400">
              {item.category || "기타"}
            </span>
          </div>
        </div>
      </Link>

      {action}
    </article>
  );
}
