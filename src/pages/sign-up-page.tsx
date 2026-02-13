import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo";
import { Input } from "@/components/ui/input";
import { useSignUp } from "@/hooks/mutations/use-sign-up";
import { generateErrorMessage } from "@/lib/error";
import { toast } from "sonner";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: signUp, isPending: isSignUpPending } = useSignUp({
    onError: (error) => {
      const message = generateErrorMessage(error);
      toast.error(message, {
        position: "top-center",
      });
    },
  });

  const handleSignUpClick = () => {
    if (email.trim() === "") return;
    if (password.trim() === "") return;

    signUp({ email, password });
  };

  return (
    // [1] 배경 및 중앙 정렬 (화면 꽉 채우기 + 회색 배경)
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* [2] 하얀색 카드 박스 (최대 너비 고정 + 그림자) */}
      <div className="w-full max-w-100 bg-white border rounded-xl shadow-sm p-8">
        {/* 헤더 섹션 (로고 + 제목) */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Logo />
          <h1 className="text-xl font-bold tracking-tight text-gray-900 mt-2">
            회원가입
          </h1>
          <p className="text-sm text-gray-500">84에 오신 것을 환영합니다.</p>
        </div>

        {/* 폼 섹션 */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {/* 이메일 입력 */}
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                이메일
              </label>
              {/* Shadcn Input이 없다면 그냥 input에 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background..." 넣으면 됨 */}
              <Input
                disabled={isSignUpPending}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="example@email.com"
                className="h-11" // 높이 조금 키움
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">
                비밀번호
              </label>
              <Input
                disabled={isSignUpPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="비밀번호를 입력해주세요"
                className="h-11"
              />
            </div>

            {/* 비밀번호 확인 (회원가입엔 필수!) */}
            {/* <div className="space-y-1">
              <label className="text-sm font-medium leading-none">
                비밀번호 확인
              </label>
              <Input
                type="password"
                placeholder="비밀번호 다시 입력"
                className="h-11"
              />
            </div> */}
          </div>

          {/* 버튼 */}
          <Button
            disabled={isSignUpPending}
            onClick={handleSignUpClick}
            className="w-full h-11 text-base font-bold bg-primary hover:bg-primary/90"
          >
            가입하기
          </Button>
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link
            to="/sign-in"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
