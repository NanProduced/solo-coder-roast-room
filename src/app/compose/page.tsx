"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComposeNavBar } from "@/components/NavigationBar";
import { Avatar } from "@/components/Avatar";
import { ImagePlus, MapPin, Users, Bell, HelpCircle } from "lucide-react";
import Image from "next/image";

const USER_AVATAR =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20cartoon%20character%20avatar%20smiling%20warm%20pixel%20art%20style&image_size=square";
const USER_NICKNAME = "我";

export default function ComposePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

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

  const remainingSlots = 9 - images.length;

  return (
    <div className="flex flex-col h-screen bg-white">
      <ComposeNavBar onPublish={canPublish ? handlePublish : undefined} />

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-4 flex gap-3">
          <Avatar src={USER_AVATAR} alt={USER_NICKNAME} size="md" priority />

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="这一刻的想法..."
              className="w-full min-h-[120px] resize-none text-base text-[#191919] placeholder:text-[#C8C8C8] focus:outline-none bg-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square bg-[#F5F5F5] overflow-hidden rounded-sm"
              >
                <Image
                  src={image}
                  alt={`图片 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized
                />
                <button
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
                  onClick={() => handleRemoveImage(index)}
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {remainingSlots > 0 && (
              <button
                onClick={handleAddImage}
                className="aspect-square bg-[#FAFAFA] border border-[#E6E6E6] rounded-sm flex flex-col items-center justify-center hover:bg-[#F5F5F5] transition-colors"
              >
                <ImagePlus className="w-7 h-7 text-[#B2B2B2] mb-1" />
                {images.length === 0 && (
                  <span className="text-xs text-[#B2B2B2]">添加图片</span>
                )}
              </button>
            )}
          </div>

          {images.length > 0 && (
            <div className="mt-2 text-xs text-[#B2B2B2]">
              图片 {images.length}/9
            </div>
          )}
        </div>

        <div className="border-t border-[#E6E6E6]">
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F7F7F7] transition-colors active:bg-[#EDEDED]">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#B2B2B2]" />
              <span className="text-sm text-[#B2B2B2]">所在位置</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#B2B2B2]">不显示位置</span>
              <svg
                className="w-4 h-4 text-[#C8C8C8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <div className="border-t border-[#E6E6E6]" />

          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F7F7F7] transition-colors active:bg-[#EDEDED]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B2B2B2]" />
              <span className="text-sm text-[#B2B2B2]">谁可以看</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#B2B2B2]">公开</span>
              <svg
                className="w-4 h-4 text-[#C8C8C8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <div className="border-t border-[#E6E6E6]" />

          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F7F7F7] transition-colors active:bg-[#EDEDED]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#B2B2B2]" />
              <span className="text-sm text-[#B2B2B2]">提醒谁看</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-[#C8C8C8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>

        <div className="h-20" />
      </div>

      <div className="fixed bottom-4 right-4 z-20">
        <div className="relative">
          <button
            className="w-9 h-9 flex items-center justify-center text-[#B2B2B2] hover:text-[#576B95] transition-colors"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {showHelp && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#333333] text-white text-xs px-3 py-2 rounded shadow-lg">
              <p className="mb-1">💡 发布后，杠精们会在 5-20 秒内陆续出现并评论你的动态。</p>
              <p className="mb-1">💬 你可以回复他们，他们会根据人设决定如何回应。</p>
              <p>📷 支持 Ctrl+V 粘贴剪贴板中的图片</p>
              <div className="absolute bottom-0 right-4 translate-y-1/2 w-2 h-2 bg-[#333333] rotate-45" />
            </div>
          )}
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
