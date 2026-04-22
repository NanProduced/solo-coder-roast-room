"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComposeNavBar } from "@/components/NavigationBar";
import { ImageUploadGrid } from "@/components/ImageGrid";
import { Avatar } from "@/components/Avatar";

const USER_AVATAR =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20cartoon%20character%20avatar%20smiling%20warm%20pixel%20art%20style&image_size=square";
const USER_NICKNAME = "我";

export default function ComposePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const remainingSlots = 9 - images.length;
      if (remainingSlots <= 0) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              setImages((prev) => {
                if (prev.length >= 9) return prev;
                return [...prev, result];
              });
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [images.length]);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 9 - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!content.trim() && images.length === 0) {
      return;
    }

    try {
      const draftData = {
        content: content.trim(),
        images: images,
        timestamp: Date.now(),
      };

      localStorage.setItem("roast_room_draft", JSON.stringify(draftData));

      router.push("/");
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("保存失败，请重试");
    }
  };

  const canPublish = content.trim() || images.length > 0;

  return (
    <div className="flex flex-col h-screen bg-white">
      <ComposeNavBar onPublish={canPublish ? handlePublish : undefined} />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex gap-3">
          <Avatar src={USER_AVATAR} alt={USER_NICKNAME} size="lg" priority />

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="这一刻的想法..."
              className="w-full h-40 resize-none text-base text-[#191919] placeholder:text-[#999999] focus:outline-none bg-transparent"
              autoFocus
            />

            <div className="mt-4">
              <ImageUploadGrid
                images={images}
                maxImages={9}
                onAdd={handleAddImage}
                onRemove={handleRemoveImage}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E6E6E6]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#999999]">
              {content.length > 0 ? `${content.length}/2000` : "2000字以内"}
            </span>
            <span className="text-sm text-[#999999]">
              {images.length}/9 张图片
            </span>
          </div>

          <div className="mt-4 p-3 bg-[#FFF8E6] rounded-lg">
            <p className="text-xs text-[#B8860B]">
              💡 提示：发布后，杠精们会在 5-20 秒内陆续出现并评论你的动态。
              你可以回复他们，他们会根据人设决定如何回应。
            </p>
            <p className="text-xs text-[#B8860B] mt-1">
              📷 支持 Ctrl+V 粘贴剪贴板中的图片
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
