import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getItem, updateItem, createItem } from "@/api/item";
import { uploadImage } from "@/api/image"; // 이미지 업로드 함수 필요
import { useSession } from "@/store/session";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import type { ImageItem } from "@/types";

export default function ItemCreatePage() {
  const { itemId } = useParams();
  const isEditMode = !!itemId;

  const navigate = useNavigate();
  const session = useSession();

  // 폼 데이터
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "기타",
  });

  // ⭐ 핵심: 기존 이미지와 새 이미지를 통합 관리하는 State
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. [수정 모드] 데이터 불러오기
  const { data: existingProduct, isLoading: isFetching } = useQuery({
    queryKey: ["product", itemId],
    queryFn: () => getItem(itemId!),
    enabled: isEditMode,
  });

  // 2. 데이터 채우기
  useEffect(() => {
    if (isEditMode && existingProduct) {
      setFormData({
        title: existingProduct.title,
        price: String(existingProduct.price),
        description: existingProduct.description,
        category: existingProduct.category || "기타",
      });

      // 기존 이미지 URL들을 ImageItem 형식으로 변환해서 넣기
      if (existingProduct.image) {
        const initialImages = existingProduct.image.map((url: string) => ({
          id: url, // 기존 이미지는 URL 자체가 ID 역할
          url: url,
          file: undefined, // 파일 객체는 없음
        }));
        setImageList(initialImages);
      }
    }
  }, [isEditMode, existingProduct]);

  // 3. 입력 핸들러
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ⭐ 4. 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36), // 임시 ID 생성
      url: URL.createObjectURL(file), // 미리보기 URL
      file: file, // 업로드할 파일 객체
    }));

    setImageList((prev) => [...prev, ...newItems]);
  };

  // ⭐ 5. 이미지 삭제 핸들러
  const removeImage = (targetId: string) => {
    setImageList((prev) => prev.filter((item) => item.id !== targetId));
  };

  // 6. 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return toast.error("로그인이 필요합니다.");
    const { title, price, description, category } = formData;
    if (!title || !price || !description)
      return toast.error("빈칸을 채워주세요.");

    setIsLoading(true); // 🔴 로딩 시작 (버튼 비활성화용)

    try {
      // 1) 새 이미지만 골라서 업로드 수행
      const newImages = imageList.filter((item) => item.file);

      const uploadPromises = newImages.map(async (item) => {
        const file = item.file!;
        const fileExt = file.name.split(".").pop() || "webp";
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

        // itemId가 없으면(등록) 임시 ID 사용, 있으면(수정) 기존 ID 사용
        // (주의: 등록 시에는 아직 item.id가 없어서 user_id 폴더에 임시로 넣거나 로직 조정 필요)
        // 여기서는 간단하게 user_id 아래에 둡니다.
        const pathId = isEditMode ? itemId : "temp";
        const filePath = `${session.user?.id}/${pathId}/${fileName}`;

        return await uploadImage({ file, filePath });
      });

      // 2) 업로드된 URL들 받기
      const uploadedUrls = await Promise.all(uploadPromises);

      // 3) 최종 DB에 저장할 URL 리스트 만들기
      // (기존 이미지 중 안 지워진 것들 + 새로 업로드된 URL들)
      let finalImageUrls: string[] = [];
      let uploadIndex = 0;

      imageList.forEach((item) => {
        if (item.file) {
          // 새 파일이었던 자리는 업로드된 URL로 교체
          finalImageUrls.push(uploadedUrls[uploadIndex]);
          uploadIndex++;
        } else {
          // 기존 파일은 URL 그대로 유지
          finalImageUrls.push(item.url);
        }
      });

      const productData = {
        title,
        price: Number(price),
        description,
        category,
        image: finalImageUrls, // ⭐ 완성된 URL 배열
      };

      if (isEditMode) {
        // [수정]
        await updateItem(itemId!, productData);
        toast.success("상품이 수정되었습니다!");
        navigate(`/item/${itemId}`);
      } else {
        // [등록]
        // 등록은 createItemWithImages를 안 쓰고 직접 createItem을 씁니다 (로직 통일을 위해)
        await createItem({
          ...productData,
          seller_id: session.user.id,
        });
        toast.success("상품이 등록되었습니다!");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("작업 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 🔴 로딩 끝
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pb-20 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "상품 수정하기" : "내 물건 팔기"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-2">상품 이미지</label>
          <div className="flex gap-2 overflow-x-auto py-2">
            <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 shrink-0">
              <Plus className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">추가</span>
              <input
                type="file"
                multiple
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                // disabled 삭제함 (이제 수정 때도 가능!)
              />
            </label>

            {imageList.map((item) => (
              <div
                key={item.id}
                className="relative w-20 h-20 shrink-0 border rounded-md overflow-hidden"
              >
                <img
                  src={item.url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(item.id)}
                  className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 나머지 입력 필드들 (기존과 동일) */}
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border rounded-md p-3 text-sm focus:outline-none focus:border-orange-500"
            placeholder="상품 제목"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full border rounded-md p-3 text-sm bg-white"
          >
            <option value="기타">기타</option>
            <option value="디지털기기">디지털기기</option>
            <option value="생활가전">생활가전</option>
            <option value="가구/인테리어">가구/인테리어</option>
            <option value="의류">의류</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">가격</label>
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full border rounded-md p-3 text-sm focus:outline-none focus:border-orange-500"
              placeholder="가격"
            />
            <span className="absolute right-3 top-3 text-sm text-gray-400">
              원
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">설명</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border rounded-md p-3 h-40 text-sm resize-none"
            placeholder="설명을 입력하세요"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-xl mx-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={() => navigate(-1)}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 font-bold"
            disabled={isLoading} // ⭐ 여기서 isLoading 사용 (중복 클릭 방지)
          >
            {isLoading ? "처리 중..." : isEditMode ? "수정 완료" : "등록 완료"}
          </Button>
        </div>
      </form>
    </div>
  );
}
