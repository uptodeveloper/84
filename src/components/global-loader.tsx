import Logo from "@/assets/logo";

export default function GlobalLoader() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center py-20">
      <div className="mb-15 flex animate-bounce gap-4">
        <Logo />
        <div className="text-2xl font-bold">팔고 사고</div>
      </div>
    </div>
  );
}
