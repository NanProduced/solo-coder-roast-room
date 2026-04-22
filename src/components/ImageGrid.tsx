"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, Plus } from "lucide-react";

interface ImageGridProps {
  images: string[];
  removable?: boolean;
  onRemove?: (index: number) => void;
  onClick?: (index: number) => void;
  maxCount?: number;
  className?: string;
}

export function ImageGrid({
  images,
  removable = false,
  onRemove,
  onClick,
  maxCount = 9,
  className,
}: ImageGridProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const displayImages = images.slice(0, maxCount);
  const imageCount = displayImages.length;

  let gridCols = 3;
  let gapClass = "gap-1";

  if (imageCount === 1) {
    gridCols = 1;
    gapClass = "";
  } else if (imageCount === 2 || imageCount === 4) {
    gridCols = 2;
    gapClass = "gap-1";
  }

  const getImageSizeClass = () => {
    if (imageCount === 1) {
      return "w-40 h-40";
    }
    return "w-full aspect-square";
  };

  const getContainerClass = () => {
    if (imageCount === 1) {
      return "flex";
    }
    return `grid grid-cols-${gridCols} ${gapClass}`;
  };

  if (imageCount === 0) return null;

  return (
    <div className={cn(getContainerClass(), className)}>
      {displayImages.map((image, index) => (
        <div
          key={index}
          className={cn(
            "relative bg-[#F5F5F5] overflow-hidden cursor-pointer",
            getImageSizeClass()
          )}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
          onClick={() => onClick?.(index)}
        >
          <Image
            src={image}
            alt={`图片 ${index + 1}`}
            fill
            className="object-cover"
            sizes={imageCount === 1 ? "160px" : "100px"}
            unoptimized
          />

          {removable && hoverIndex === index && (
            <button
              className="absolute top-0 right-0 w-6 h-6 bg-black/60 flex items-center justify-center z-10"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(index);
              }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

interface ImageUploadGridProps {
  images: string[];
  maxImages?: number;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
}

export function ImageUploadGrid({
  images,
  maxImages = 9,
  onAdd,
  onRemove,
}: ImageUploadGridProps) {
  const remainingSlots = maxImages - images.length;
  const showAddButton = remainingSlots > 0;

  const gridCols = 3;
  const totalItems = showAddButton ? images.length + 1 : images.length;

  return (
    <div className={`grid grid-cols-${gridCols} gap-2`}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square bg-[#F5F5F5] overflow-hidden rounded"
        >
          <Image
            src={image}
            alt={`图片 ${index + 1}`}
            fill
            className="object-cover"
            sizes="100px"
            unoptimized
          />
          <button
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center z-10"
            onClick={() => onRemove?.(index)}
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ))}

      {showAddButton && (
        <button
          className="aspect-square bg-[#F7F7F7] border-2 border-dashed border-[#D9D9D9] rounded flex flex-col items-center justify-center text-[#999999] hover:bg-[#EDEDED] transition-colors"
          onClick={onAdd}
        >
          <Plus className="w-8 h-8 mb-1" />
          <span className="text-xs">
            {remainingSlots === maxImages ? "添加图片" : `还可加${remainingSlots}张`}
          </span>
        </button>
      )}
    </div>
  );
}
