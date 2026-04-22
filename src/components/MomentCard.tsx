"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Avatar } from "./Avatar";
import { ImageGrid } from "./ImageGrid";
import { ActionMenu } from "./ActionMenu";
import { CommentSection, LikeSection } from "./CommentBubble";
import { cn, formatTime, generateId } from "@/lib/utils";
import type { Post, Comment, Like } from "@/types";

interface MomentCardProps {
  post: Post;
  userAvatar: string;
  userNickname: string;
  isLikedByUser: boolean;
  onLike: () => void;
  onCommentClick: (comment?: Comment) => void;
  newCommentId?: string;
  className?: string;
}

export function MomentCard({
  post,
  userAvatar,
  userNickname,
  isLikedByUser,
  onLike,
  onCommentClick,
  newCommentId,
  className,
}: MomentCardProps) {
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [liked, setLiked] = useState(isLikedByUser);

  useEffect(() => {
    setLiked(isLikedByUser);
  }, [isLikedByUser]);

  const handleLike = () => {
    if (!liked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 400);
    }
    setLiked(!liked);
    onLike();
  };

  const allLikes = post.likes.slice();
  if (liked && !allLikes.some((l) => l.personalityId === "user")) {
    allLikes.unshift({
      id: "user-like",
      personalityId: "user",
      personality: {
        id: "user",
        name: userNickname,
        type: "挑刺专家",
        avatar: userAvatar,
        nickname: userNickname,
        description: "",
        behavior: {
          commentDelay: [0, 0],
          likeProbability: 0,
          replyProbability: 0,
          backdownProbability: 0,
          followUpCommentDelay: [0, 0],
        },
        tone: "",
        keywords: [],
        examples: [],
      },
      timestamp: Date.now(),
    });
  }

  const likeNicknames = allLikes.map((l) => ({
    nickname: l.personality.nickname,
  }));

  return (
    <div className={cn("bg-white px-4 py-3", className)}>
      <div className="flex gap-3">
        <Avatar src={userAvatar} alt={userNickname} size="lg" priority />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[#576B95] font-medium text-sm leading-tight">
                {userNickname}
              </h3>
            </div>

            <ActionMenu
              isLiked={liked}
              likeCount={post.likes.length}
              commentCount={post.comments.length}
              onLike={handleLike}
              onComment={() => onCommentClick()}
            />
          </div>

          {post.content && (
            <p className="text-sm text-[#191919] mt-1 leading-relaxed break-words whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {post.images.length > 0 && (
            <div className="mt-2">
              <ImageGrid images={post.images} />
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#999999]">
              {formatTime(post.timestamp)}
            </span>

            <div className="relative">
              <AnimatePresence>
                {showHeartAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 z-10"
                  >
                    <Heart className="w-10 h-10 fill-[#FA5151] text-[#FA5151]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {likeNicknames.length > 0 && (
            <LikeSection likes={likeNicknames} className="mt-1" />
          )}

          {post.comments.length > 0 && (
            <CommentSection
              comments={post.comments}
              userNickname={userNickname}
              onReply={onCommentClick}
              newCommentId={newCommentId}
              className="mt-1"
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface EmptyMomentProps {
  onPublish: () => void;
  className?: string;
}

export function EmptyMoment({ onPublish, className }: EmptyMomentProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-8",
        className
      )}
    >
      <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4">
        <svg
          className="w-12 h-12 text-[#999999]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-[#191919] mb-2">杠精剧场</h3>
      <p className="text-sm text-[#999999] text-center mb-6">
        发布一条动态，看看杠精们如何怼你
      </p>

      <button
        onClick={onPublish}
        className="px-6 py-2.5 bg-[#07C160] text-white rounded-lg text-sm font-medium hover:bg-[#06AD56] transition-colors"
      >
        发布动态
      </button>
    </div>
  );
}
