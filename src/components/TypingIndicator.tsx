"use client";

import { motion } from "framer-motion";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  nickname: string;
  avatar: string;
  className?: string;
}

export function TypingIndicator({
  nickname,
  avatar,
  className,
}: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex items-center gap-2 py-2 px-3", className)}
    >
      <Avatar src={avatar} alt={nickname} size="sm" />
      <div className="flex flex-col">
        <span className="text-xs text-[#999999] mb-1">{nickname}</span>
        <div className="flex items-center gap-1 bg-[#F5F5F5] px-2 py-1 rounded">
          <span className="w-1.5 h-1.5 bg-[#999999] rounded-full typing-dot" />
          <span className="w-1.5 h-1.5 bg-[#999999] rounded-full typing-dot" />
          <span className="w-1.5 h-1.5 bg-[#999999] rounded-full typing-dot" />
        </div>
      </div>
    </motion.div>
  );
}

interface BottomCommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  replyTarget?: string;
  onCancelReply?: () => void;
  className?: string;
}

export function BottomCommentInput({
  value,
  onChange,
  onSend,
  placeholder = "写评论...",
  replyTarget,
  onCancelReply,
  className,
}: BottomCommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#F7F7F7] border-t border-[#E6E6E6] px-3 py-2 z-50",
        className
      )}
    >
      {replyTarget && (
        <div className="flex items-center justify-between mb-1.5 text-xs text-[#999999]">
          <span>
            回复
            <span className="text-[#576B95]"> @{replyTarget}</span>
          </span>
          {onCancelReply && (
            <button
              className="text-[#FA5151] hover:opacity-80"
              onClick={onCancelReply}
            >
              取消
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-9 px-3 bg-white border border-[#E6E6E6] rounded text-sm focus:outline-none focus:border-[#07C160] transition-colors"
          />
        </div>

        <button
          className={cn(
            "h-9 px-4 rounded text-sm font-medium transition-colors",
            value.trim()
              ? "bg-[#07C160] text-white"
              : "bg-[#E6E6E6] text-[#B2B2B2] cursor-not-allowed"
          )}
          onClick={onSend}
          disabled={!value.trim()}
        >
          发送
        </button>
      </div>
    </div>
  );
}
