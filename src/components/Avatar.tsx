import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const sizeDimensions = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export function Avatar({ src, alt, size = "md", className, priority = false }: AvatarProps) {
  return (
    <div className={cn("relative rounded overflow-hidden bg-[#F5F5F5]", sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${sizeDimensions[size]}px`}
        priority={priority}
        unoptimized
      />
    </div>
  );
}
