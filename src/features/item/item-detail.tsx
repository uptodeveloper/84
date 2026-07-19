import type { Product } from "@/types";
import ItemDetailInteractions from "./item-detail-interactions";
import ProductInfoSection from "./product-info-section";
import ProductMediaSection from "./product-media-section";

interface ItemDetailProps {
  product: Product;
}

export default function ItemDetail({ product }: ItemDetailProps) {
  const productStatus = product.status ?? "FOR_SALE";

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

          <ItemDetailInteractions
            productId={product.id}
            sellerId={product.seller_id}
            status={productStatus}
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
        <ItemDetailInteractions
          isMobile
          productId={product.id}
          sellerId={product.seller_id}
          status={productStatus}
        />
      </div>
    </div>
  );
}
