"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, Camera, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface NavigationBarProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onRightClick?: () => void;
  className?: string;
}

export function NavigationBar({
  title,
  showBack = false,
  rightAction,
  onRightClick,
  className,
}: NavigationBarProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-[#F7F7F7] border-b border-[#E6E6E6]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#576B95] hover:bg-[#E6E6E6]"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
      </div>

      <h1 className="text-base font-medium text-[#191919]">{title}</h1>

      <div className="flex items-center gap-2">
        {rightAction ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#576B95] hover:bg-[#E6E6E6]"
            onClick={onRightClick}
          >
            {rightAction}
          </Button>
        ) : (
          <div className="w-8" />
        )}
      </div>
    </div>
  );
}

export function MomentsNavBar() {
  return (
    <NavigationBar
      title="杠精剧场"
      rightAction={<Camera className="h-6 w-6" />}
    />
  );
}

export function ComposeNavBar({ onPublish }: { onPublish?: () => void }) {
  return (
    <div className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-[#F7F7F7] border-b border-[#E6E6E6]">
      <Button
        variant="ghost"
        className="h-8 px-0 text-[#576B95] hover:bg-transparent hover:text-[#4A5A78]"
      >
        取消
      </Button>

      <h1 className="text-base font-medium text-[#191919]">发表动态</h1>

      <Button
        variant="wechat"
        className="h-8 px-4 text-sm rounded"
        onClick={onPublish}
      >
        发表
      </Button>
    </div>
  );
}
