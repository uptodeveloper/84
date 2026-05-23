import type { Product } from "@/types";

interface ProductInfoSectionProps {
  product: Product;
}

export default function ProductInfoSection({ product }: ProductInfoSectionProps) {
  return (
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
      </div>

      <hr className="border-gray-100 my-6" />

      <div className="flex items-center justify-between">
        {product.status === "SOLD_OUT" && (
          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
            판매완료
          </span>
        )}
      </div>
    </div>
  );
}
