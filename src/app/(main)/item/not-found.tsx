import { Button } from "@/components/ui/button";
import { PackageX } from "lucide-react";
import Link from "next/link";

export default function ItemNotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <PackageX className="mb-4 size-12 text-gray-400" aria-hidden="true" />
      <h1 className="text-xl font-bold text-gray-900">상품을 찾을 수 없습니다</h1>
      {/* 상품 없음과 권한 부족을 같은 문구로 처리해 다른 사용자의 상품 정보를 노출하지 않습니다. */}
      <p className="mt-2 text-sm text-gray-500">
        상품이 삭제되었거나 접근 권한이 없습니다.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </section>
  );
}
