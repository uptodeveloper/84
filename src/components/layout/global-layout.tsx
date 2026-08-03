"use client";

import Logo from "@/assets/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User,
  MessageCircle, // 아이콘 추가
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { toast } from "sonner";
import { useViewer } from "@/features/auth/use-viewer";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  const router = useRouter(); // 👈 페이지 이동 훅
  const [keyword, setKeyword] = useState(""); // 👈 입력값 상태
  const { data: viewer, isPending: isViewerPending } = useViewer();
  const isAuthed = !!viewer?.userId;

  const { mutate: logout, isPending: isLoggingOut } = useSignOut({
    onSuccess: () => {
      toast.success("로그아웃되었습니다.");
      router.replace("/");
    },
    onError: () => {
      toast.error("로그아웃에 실패했습니다.");
    },
  });

  // 검색 핸들러
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // 엔터 치면 메인 페이지로 이동하면서 쿼리 파라미터 전달
      // 예: /?q=노트북
      router.push(`/?q=${keyword}`);
    }
  };
  return (
    <div className="min-h-screen flex flex-col relative bg-gray-50">
      {/* 1. 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        {/* max-w-screen-xl (1280px)로 고정하여 너무 넓어지는 것 방지 */}
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-end w-full">
          {" "}
          {/* ✅ Auth 영역 */}
          {isViewerPending ? (
            // 로그인 여부를 확인하는 동안 잘못된 버튼이 잠깐 보이지 않도록 같은 크기의 자리만 유지합니다.
            <div className="h-5 w-12" aria-hidden="true" />
          ) : !isAuthed ? (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-gray-700 hover:text-primary transition-colors"
              >
                로그인
              </Link>
              {/* <span className="text-gray-300">|</span> */}
              {/* <Link
                to="/sign-up"
                className="text-xs font-semibold text-gray-700 hover:text-primary transition-colors"
              >
                회원가입
              </Link> */}
            </div>
          ) : (
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => logout()}
              className="text-xs font-semibold text-gray-700 hover:text-primary transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "로그아웃중..." : "로그아웃"}
            </button>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-8">
          <Link href={"/"} className="shrink-0">
            <Logo />
          </Link>

          <div className="flex-1 max-w-lg relative">
            <input
              value={keyword} // 👈 연결
              onChange={(e) => setKeyword(e.target.value)} // 👈 연결
              onKeyDown={handleSearch} // 👈 연결
              type="text"
              placeholder="상점명, 물품명 등을 검색해 보세요!"
              className="w-full h-10 pl-4 pr-10 border-2 border-primary/20 rounded-md focus:outline-none focus:border-primary transition-colors text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <Link
              href="/chat"
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-6 h-6" />

              <span className="text-[10px] font-medium">채팅</span>
            </Link>

            <Link
              href="/item-upload"
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="text-[10px] font-medium">판매하기</span>
            </Link>
            <Link
              href="/my"
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-primary transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-[10px] font-medium">내상점</span>
            </Link>
          </div>
        </div>
        {/* next dev
        <div className="border-t">
          <div className="max-w-screen-xl mx-auto px-4 h-10 flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-primary">
              <Menu className="w-4 h-4" />
              카테고리
            </button>
          </div>
        </div> */}
      </header>

      {/* 2. 메인 컨텐츠 (여기가 핵심!) */}
      {/* relative를 줘서 사이드바(absolute)의 기준점이 되게 함 */}
      <div className="flex-1 max-w-screen-xl w-full mx-auto px-4 py-8 relative">
        {/* [A] 본문 영역 */}
        {/* w-full로 꽉 채워서 헤더와 라인을 완벽하게 맞춤 */}
        <main className="w-full">
          {children}
        </main>

        {/* [B] 우측 날개 사이드바 (기능은 나중에) (Absolute Positioning) */}
        {/* 설명: 컨테이너의 오른쪽 끝(right-0)에서 바깥으로 100% 이동(translate-x-full) + 여백(ml-4) */}
        {/* hidden 2xl:block -> 화면이 좁으면(노트북 등) 본문을 가리니까 숨김. 넓은 화면(데스크탑)에서만 보임 */}
        {/* 
        <aside className="hidden xl:block absolute top-5 right-0 translate-x-full ml-6 w-24 h-full">
          <div className="sticky top-30 flex flex-col gap-3">
            최근 본 상품 박스
            <div className="bg-white border border-gray-200 rounded-md shadow-sm p-2 flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-gray-800 py-1">
                최근본상품
              </span>

              점선 구분선
              <div className="w-full border-t border-dashed border-gray-300"></div>

              상품 썸네일 (더미)
              이미지 없을 땐 회색 박스
              <div className="w-full aspect-square bg-gray-100 rounded text-[10px] flex items-center justify-center text-gray-400">
                상품1
              </div>
              <div className="w-full aspect-square bg-gray-100 rounded text-[10px] flex items-center justify-center text-gray-400">
                상품2
              </div>

              <div className="w-full border-t border-gray-100 my-1"></div>

              <button className="text-[10px] text-gray-500 hover:text-primary font-medium w-full py-1 border rounded bg-gray-50">
                TOP
              </button>
            </div>
          </div>
        </aside> */}
      </div>

      {/* 3. 플로팅 채팅 버튼 (우측 하단 고정) */}
      {/* <div className="fixed bottom-30 right-5 z-50">
        <button
          className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
          onClick={() => alert("채팅 모달 열림!")}
        >
          <MessageSquareText className="w-7 h-7" />
          <span className="sr-only">채팅하기</span>
        </button>
      </div> */}

      {/* 4. 푸터 */}
      <footer className="bg-white border-t py-12 mt-auto">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 text-gray-500 text-sm mb-4">
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>사업자정보확인</span>
          </div>
          <p className="text-gray-400 text-xs">
            &copy; 2026 Project 84. All right reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
