import { Button } from "@/components/ui/button";
import { MessageCircleOff } from "lucide-react";
import Link from "next/link";

export default function ChatNotFound() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <MessageCircleOff
        className="mb-4 size-12 text-gray-400"
        aria-hidden="true"
      />
      <h1 className="text-xl font-bold text-gray-900">
        채팅방을 찾을 수 없습니다
      </h1>
      {/* 방 없음과 권한 부족을 같은 문구로 처리해 다른 사용자의 채팅방 정보를 노출하지 않습니다. */}
      <p className="mt-2 text-sm text-gray-500">
        채팅방이 삭제되었거나 접근 권한이 없습니다.
      </p>
      <Button asChild className="mt-6">
        <Link href="/chat">채팅 목록으로 돌아가기</Link>
      </Button>
    </section>
  );
}
