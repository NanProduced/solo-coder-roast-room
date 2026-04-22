"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionMenuProps {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onComment: () => void;
  className?: string;
}

export function ActionMenu({
  isLiked,
  likeCount,
  commentCount,
  onLike,
  onComment,
  className,
}: ActionMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLikeClick = () => {
    onLike();
    setShowMenu(false);
  };

  const handleCommentClick = () => {
    onComment();
    setShowMenu(false);
  };

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#3D3D3D] rounded-md flex items-center gap-0 px-1 py-0.5 z-50"
          style={{ minWidth: "160px" }}
        >
          <div className="absolute right-0 translate-x-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-[#3D3D3D]" />

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm hover:bg-white/10 rounded transition-colors"
            onClick={handleLikeClick}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                isLiked ? "fill-[#FA5151] text-[#FA5151]" : "text-white"
              )}
            />
            <span>{isLiked ? "取消" : "赞"}</span>
          </button>

          <div className="w-px h-4 bg-white/30" />

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-sm hover:bg-white/10 rounded transition-colors"
            onClick={handleCommentClick}
          >
            <MessageCircle className="w-4 h-4" />
            <span>评论</span>
          </button>
        </div>
      )}

      <button
        ref={buttonRef}
        className="p-1.5 hover:bg-[#E6E6E6] rounded transition-colors"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreHorizontal className="w-5 h-5 text-[#999999]" />
      </button>
    </div>
  );
}

interface SimpleActionButtonProps {
  isLiked: boolean;
  likeCount?: number;
  commentCount?: number;
  onLike: () => void;
  onComment: () => void;
  className?: string;
}

export function SimpleActionButton({
  isLiked,
  likeCount,
  commentCount,
  onLike,
  onComment,
  className,
}: SimpleActionButtonProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        className="flex items-center gap-1 text-[#999999] hover:text-[#576B95] transition-colors"
        onClick={onLike}
      >
        <Heart
          className={cn(
            "w-5 h-5",
            isLiked ? "fill-[#FA5151] text-[#FA5151]" : ""
          )}
        />
        {likeCount !== undefined && likeCount > 0 && (
          <span className="text-xs">{likeCount}</span>
        )}
      </button>

      <button
        className="flex items-center gap-1 text-[#999999] hover:text-[#576B95] transition-colors"
        onClick={onComment}
      >
        <MessageCircle className="w-5 h-5" />
        {commentCount !== undefined && commentCount > 0 && (
          <span className="text-xs">{commentCount}</span>
        )}
      </button>
    </div>
  );
}
