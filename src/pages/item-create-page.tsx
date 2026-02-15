import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious, // 필요하면 추가
} from "@/components/ui/carousel";
import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { useCreateItem } from "@/hooks/mutations/item/use-create-item"; // 경로 확인
import { toast } from "sonner";
import { generateErrorMessage } from "@/lib/error";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/store/session";

// 이미지 타입 정의
type ImagePreview = {
  file: File;
  previewUrl: string;
};

export default function ItemCreatePage() {
  const navigate = useNavigate();
  const session = useSession();

  // 변수명 통일: images (배열)
  const [images, setImages] = useState<ImagePreview[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createItem, isPending } = useCreateItem({
    onSuccess: () => {
      toast.success("상품 등록 완료!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error));
    },
  });

  // 이미지 추가 핸들러
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      // 기존 이미지 뒤에 추가
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = (targetUrl: string) => {
    setImages((prev) => prev.filter((img) => img.previewUrl !== targetUrl));
    // 메모리 누수 방지 (선택사항)
    URL.revokeObjectURL(targetUrl);
  };

  // 입력 핸들러
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 등록 버튼 핸들러
  const handleCreateItemClick = () => {
    if (!session?.user) return toast.error("로그인이 필요합니다.");
    if (images.length === 0) return toast.error("이미지를 등록해주세요.");

    createItem({
      title: formData.title,
      price: Number(formData.price),
      description: formData.description,
      category: formData.category,
      images: images.map((img) => img.file), // File 객체 배열만 추출해서 전달
      user_id: session.user.id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">상품 등록하기</h1>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* [좌측] 이미지 업로드 & 캐러셀 영역 */}
          <div className="w-full md:w-[400px] shrink-0">
            {/* 이미지가 있을 때: 캐러셀 보여주기 */}
            {images.length > 0 ? (
              <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border">
                <Carousel className="w-full h-full">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem
                        key={image.previewUrl}
                        className="w-full h-full"
                      >
                        <div className="relative w-full aspect-square">
                          <img
                            src={image.previewUrl}
                            alt={`preview-${index}`}
                            className="w-full h-full object-cover"
                          />
                          {/* 삭제 버튼 */}
                          <button
                            onClick={() => handleDeleteImage(image.previewUrl)}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                            type="button"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {/* 화살표 필요하면 주석 해제 */}
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>

                {/* 추가 업로드 버튼 (작게 표시) */}
                <div
                  className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow cursor-pointer hover:bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            ) : (
              // 이미지가 없을 때: 큰 업로드 박스
              <label
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center justify-center w-full aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">이미지 등록</span>
              </label>
            )}

            {/* 숨겨진 input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple // 다중 선택 가능
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          {/* [우측] 입력 폼 (기존 유지) */}
          <div className="flex flex-col gap-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="상품명"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">가격</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="가격"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full h-10 border rounded-md px-3"
              >
                <option value="">선택하세요</option>
                <option value="digital">디지털기기</option>
                <option value="clothing">의류</option>
              </select>
            </div>
          </div>
        </div>

        {/* 하단 설명 */}
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="설명"
          className="min-h-[200px]"
        />

        {/* 버튼 */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button onClick={handleCreateItemClick} disabled={isPending}>
            {isPending ? "등록 중..." : "등록하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
