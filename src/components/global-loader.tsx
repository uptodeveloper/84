import Logo from "@/assets/logo";

export default function GlobalLoader() {
  return (
    <div className="bg-muted flex h-screen w-screen flex-col items-center justify-center">
      <div className="mb-15 flex animate-bounce items-center gap-4">
        <Logo />
        <div className="text-2xl font-bold">팔고 사고</div>
      </div>
    </div>
  );
}
