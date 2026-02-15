import Logo from "@/assets/logo";

export default function GlobalLoader() {
  return (
    <div className=" flex flex-col items-center justify-center w-full min-h-[calc(100vh-200px)] py-20">
      <div className="mb-15 flex animate-bounce  gap-4">
        <Logo />
        <div className="text-2xl font-bold">팔고 사고</div>
      </div>
    </div>
  );
}
