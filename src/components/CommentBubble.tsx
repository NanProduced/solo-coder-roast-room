"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import type { Comment } from "@/types";

interface CommentBubbleProps {
  comment: Comment;
  userNickname?: string;
  onReply?: (comment: Comment) => void;
  animate?: boolean;
  className?: string;
}

export function CommentBubble({
  comment,
  userNickname = "我",
  onReply,
  animate = false,
  className,
}: CommentBubbleProps) {
  const isUser = comment.isUser;

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <motion.div
      {...motionProps}
      className={cn(
        "flex gap-2 py-1.5 group",
        className
      )}
      onClick={() => onReply?.(comment)}
    >
      <span
        className={cn(
          "text-sm font-medium flex-shrink-0",
          isUser ? "text-[#576B95]" : "text-[#576B95]"
        )}
      >
        {isUser ? userNickname : comment.personality.nickname}
      </span>

      {comment.replyTo && (
        <span className="text-sm text-[#999999] flex-shrink-0">
          回复
          <span className="text-[#576B95]">{comment.replyTo.nickname}</span>
          ：
        </span>
      )}

      {!comment.replyTo && (
        <span className="text-sm text-[#999999] flex-shrink-0">：</span>
      )}

      <span className="text-sm text-[#191919] break-words">
        {comment.content}
      </span>
    </motion.div>
  );
}

interface CommentSectionProps {
  comments: Comment[];
  userNickname?: string;
  onReply?: (comment: Comment) => void;
  newCommentId?: string;
  className?: string;
}

export function CommentSection({
  comments,
  userNickname = "我",
  onReply,
  newCommentId,
  className,
}: CommentSectionProps) {
  if (comments.length === 0) return null;

  return (
    <div
      className={cn(
        "bg-[#F5F5F5] relative mt-1 px-2 py-1",
        className
      )}
    >
      <div className="absolute -top-1.5 left-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#F5F5F5]" />

      {comments.map((comment, index) => (
        <div key={comment.id}>
          <CommentBubble
            comment={comment}
            userNickname={userNickname}
            onReply={onReply}
            animate={comment.id === newCommentId}
          />
          {index < comments.length - 1 && (
            <div className="border-b border-[#E6E6E6] mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

interface LikeSectionProps {
  likes: { nickname: string }[];
  className?: string;
}

export function LikeSection({ likes, className }: LikeSectionProps) {
  if (likes.length === 0) return null;

  return (
    <div
      className={cn(
        "bg-[#F5F5F5] relative mt-1 px-2 py-1.5 flex items-center gap-1",
        className
      )}
    >
      <div className="absolute -top-1.5 left-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#F5F5F5]" />

      <svg
        className="w-3.5 h-3.5 text-[#576B95] flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>

      <div className="text-sm text-[#576B95]">
        {likes.map((like, index) => (
          <span key={index}>
            {like.nickname}
            {index < likes.length - 1 && "、"}
          </span>
        ))}
      </div>
    </div>
  );
}
