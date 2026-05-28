"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createItemAction, updateItemAction } from "./server-actions";
import { uploadImage } from "@/api/image";
import { useSession } from "@/store/session";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import type { ImageItem, Product } from "@/types";

interface ItemFormProps {
  initialProduct?: Product;
}

export default function ItemForm({ initialProduct }: ItemFormProps) {
  const isEditMode = !!initialProduct;
  const router = useRouter();
  const session = useSession();

  const [formData, setFormData] = useState({
    title: initialProduct?.title ?? "",
    price: initialProduct ? String(initialProduct.price) : "",
    description: initialProduct?.description ?? "",
    category: initialProduct?.category || "기타",
  });

  const [imageList, setImageList] = useState<ImageItem[]>(
    () =>
      initialProduct?.image?.map((url) => ({
        id: url,
        url,
        file: undefined,
      })) ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: ImageItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36),
      url: URL.createObjectURL(file),
      file,
    }));

    setImageList((prev) => [...prev, ...newItems]);
  };

  const removeImage = (targetId: string) => {
    setImageList((prev) => prev.filter((item) => item.id !== targetId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return toast.error("로그인이 필요합니다.");

    const { title, price, description, category } = formData;
    if (!title || !price || !description) {
      return toast.error("빈칸을 채워주세요.");
    }

    setIsLoading(true);

    try {
      const newImages = imageList.filter((item) => item.file);

      const uploadPromises = newImages.map(async (item) => {
        const file = item.file!;
        const fileExt = file.name.split(".").pop() || "webp";
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const pathId = initialProduct?.id ?? "temp";
        const filePath = `${session.user?.id}/${pathId}/${fileName}`;

        return await uploadImage({ file, filePath });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const finalImageUrls: string[] = [];
      let uploadIndex = 0;

      imageList.forEach((item) => {
        if (item.file) {
          finalImageUrls.push(uploadedUrls[uploadIndex]);
          uploadIndex++;
        } else {
          finalImageUrls.push(item.url);
        }
      });

      const productData = {
        title,
        price: Number(price),
        description,
        category,
        image: finalImageUrls,
      };

      if (isEditMode) {
        await updateItemAction(initialProduct.id, productData);
        toast.success("상품이 수정되었습니다.");
        router.push(`/item/${initialProduct.id}`);
      } else {
        await createItemAction({
          ...productData,
          seller_id: session.user.id,
        });
        toast.success("상품이 등록되었습니다.");
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("작업 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 pb-20 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "상품 수정하기" : "내 물건 팔기"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-xl mx-auto flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-500 font-bold"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : isEditMode ? "수정 완료" : "등록 완료"}
          </Button>
        </div>
      </form>
    </div>
  );
}
