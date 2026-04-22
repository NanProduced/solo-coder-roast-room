"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, Settings, Trash2 } from "lucide-react";
import { MomentsNavBar } from "@/components/NavigationBar";
import { MomentCard, EmptyMoment } from "@/components/MomentCard";
import { BottomCommentInput } from "@/components/TypingIndicator";
import { TypingIndicator } from "@/components/TypingIndicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateId, randomDelay } from "@/lib/utils";
import { getRandomPersonality, PERSONALITIES } from "@/lib/personalities";
import type { Post, Comment, Like } from "@/types";

const USER_AVATAR =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20cartoon%20character%20avatar%20smiling%20warm%20pixel%20art%20style&image_size=square";
const USER_NICKNAME = "我";

interface TypingState {
  personalityId: string;
  personality: typeof PERSONALITIES[0];
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [newCommentId, setNewCommentId] = useState<string | null>(null);
  const [userLikedPosts, setUserLikedPosts] = useState<Set<string>>(new Set());
  const [typingStates, setTypingStates] = useState<Map<string, TypingState>>(new Map());
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [postToEnd, setPostToEnd] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const activeTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingCommentsRef = useRef<Map<string, { comment: Comment; delay: number }>>(new Map());

  const handlePublish = () => {
    router.push("/compose");
  };

  const handleLike = (postId: string) => {
    setUserLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentClick = (postId: string, comment?: Comment) => {
    setActivePostId(postId);
    setReplyTo(comment || null);
    setShowCommentInput(true);
    setCommentValue("");
  };

  const handleSendComment = async () => {
    if (!activePostId || !commentValue.trim()) return;

    const userComment: Comment = {
      id: generateId(),
      postId: activePostId,
      personalityId: "user",
      personality: {
        id: "user",
        name: USER_NICKNAME,
        type: "挑刺专家",
        avatar: USER_AVATAR,
        nickname: USER_NICKNAME,
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
      content: commentValue.trim(),
      timestamp: Date.now(),
      isUser: true,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            nickname: replyTo.personality.nickname,
            content: replyTo.content,
          }
        : undefined,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === activePostId) {
          return {
            ...post,
            comments: [...post.comments, userComment],
          };
        }
        return post;
      })
    );

    setNewCommentId(userComment.id);
    setTimeout(() => setNewCommentId(null), 500);

    const originalComment = replyTo;
    setCommentValue("");
    setReplyTo(null);
    setShowCommentInput(false);

    if (originalComment && !originalComment.isUser) {
      await triggerAIReply(activePostId, userComment, originalComment);
    }
  };

  const triggerAIReply = async (
    postId: string,
    userComment: Comment,
    originalAIComment: Comment
  ) => {
    const personality = originalAIComment.personality;
    const behavior = personality.behavior;

    const shouldReply = Math.random() < behavior.replyProbability;
    if (!shouldReply) {
      return;
    }

    setTypingStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(personality.id, {
        personalityId: personality.id,
        personality,
      });
      return newMap;
    });

    const typingDelay = randomDelay(
      behavior.followUpCommentDelay[0],
      behavior.followUpCommentDelay[1]
    );

    const timeoutId = setTimeout(async () => {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const shouldBackdown = Math.random() < behavior.backdownProbability;

      let replyContent = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postContent: post.content,
            postImages: post.images,
            personality: personality,
            context: `用户刚才回复了"${originalAIComment.content}"说："${userComment.content}"。请根据你的人设决定是继续怼回去还是态度软化或已读不回。`,
            isReply: true,
            shouldBackdown: shouldBackdown,
            replyToContent: userComment.content,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          replyContent = data.content || personality.examples[0];
        } else {
          replyContent = getFallbackReply(personality, userComment.content, shouldBackdown);
        }
      } catch {
        replyContent = getFallbackReply(personality, userComment.content, shouldBackdown);
      }

      if (!replyContent || replyContent.trim() === "") {
        setTypingStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(personality.id);
          return newMap;
        });
        return;
      }

      const aiReply: Comment = {
        id: generateId(),
        postId: postId,
        personalityId: personality.id,
        personality: personality,
        content: replyContent,
        timestamp: Date.now(),
        isUser: false,
        replyTo: {
          id: userComment.id,
          nickname: USER_NICKNAME,
          content: userComment.content,
        },
      };

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, aiReply],
            };
          }
          return p;
        })
      );

      setNewCommentId(aiReply.id);
      setTimeout(() => setNewCommentId(null), 500);

      setTypingStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(personality.id);
        return newMap;
      });
    }, typingDelay);

    activeTimeoutsRef.current.set(generateId(), timeoutId);
  };

  const getFallbackReply = (
    personality: typeof PERSONALITIES[0],
    userContent: string,
    shouldBackdown: boolean
  ): string => {
    if (shouldBackdown) {
      return "算了，不想说了";
    }
    const examples = personality.examples;
    return examples[Math.floor(Math.random() * examples.length)];
  };

  const startCommentSimulation = useCallback((post: Post) => {
    const numComments = Math.floor(Math.random() * 4) + 2;

    for (let i = 0; i < numComments; i++) {
      const personality = getRandomPersonality();
      const delay = randomDelay(
        personality.behavior.commentDelay[0] + i * 3,
        personality.behavior.commentDelay[1] + i * 5
      );

      const commentId = generateId();
      pendingCommentsRef.current.set(commentId, {
        comment: {
          id: commentId,
          postId: post.id,
          personalityId: personality.id,
          personality: personality,
          content: "",
          timestamp: 0,
          isUser: false,
        } as Comment,
        delay,
      });

      const typingTimeoutId = setTimeout(() => {
        setTypingStates((prev) => {
          const newMap = new Map(prev);
          newMap.set(personality.id, {
            personalityId: personality.id,
            personality,
          });
          return newMap;
        });
      }, Math.max(0, delay - 2000));

      const commentTimeoutId = setTimeout(async () => {
        let commentContent = "";

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              postContent: post.content,
              postImages: post.images,
              personality: personality,
              context: `请根据你的人设，对这条朋友圈动态发表评论。保持简短（1-2句话），符合你的人格特点。`,
              isReply: false,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            commentContent = data.content || personality.examples[0];
          } else {
            commentContent = personality.examples[Math.floor(Math.random() * personality.examples.length)];
          }
        } catch {
          commentContent = personality.examples[Math.floor(Math.random() * personality.examples.length)];
        }

        if (!commentContent) return;

        const aiComment: Comment = {
          id: generateId(),
          postId: post.id,
          personalityId: personality.id,
          personality: personality,
          content: commentContent,
          timestamp: Date.now(),
          isUser: false,
        };

        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === post.id && p.isActive) {
              return {
                ...p,
                comments: [...p.comments, aiComment],
              };
            }
            return p;
          })
        );

        setNewCommentId(aiComment.id);
        setTimeout(() => setNewCommentId(null), 500);

        setTypingStates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(personality.id);
          return newMap;
        });

        if (Math.random() < personality.behavior.likeProbability) {
          const like: Like = {
            id: generateId(),
            personalityId: personality.id,
            personality: personality,
            timestamp: Date.now(),
          };

          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === post.id && p.isActive) {
                return {
                  ...p,
                  likes: [...p.likes, like],
                };
              }
              return p;
            })
          );
        }
      }, delay);

      activeTimeoutsRef.current.set(generateId(), typingTimeoutId);
      activeTimeoutsRef.current.set(generateId(), commentTimeoutId);
    }
  }, []);

  const handleEndSimulation = (postId: string) => {
    setPostToEnd(postId);
    setShowEndDialog(true);
  };

  const confirmEndSimulation = () => {
    if (!postToEnd) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postToEnd) {
          return { ...p, isActive: false };
        }
        return p;
      })
    );

    activeTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    activeTimeoutsRef.current.clear();
    setTypingStates(new Map());

    setShowEndDialog(false);
    setPostToEnd(null);
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    activeTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    activeTimeoutsRef.current.clear();
    setTypingStates(new Map());
    setPosts([]);
    setUserLikedPosts(new Set());
    setShowClearDialog(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const content = params.get("content");
    const imagesParam = params.get("images");

    if (content || imagesParam) {
      const images = imagesParam ? JSON.parse(decodeURIComponent(imagesParam)) : [];

      const newPost: Post = {
        id: generateId(),
        content: content || "",
        images: images,
        timestamp: Date.now(),
        comments: [],
        likes: [],
        isActive: true,
      };

      setPosts((prev) => [newPost, ...prev]);
      startCommentSimulation(newPost);

      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [startCommentSimulation]);

  const activePost = posts.find((p) => p.isActive);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center justify-between px-4 h-14 bg-[#F7F7F7] border-b border-[#E6E6E6]">
        <div className="w-10" />
        <h1 className="text-base font-medium text-[#191919]">杠精剧场</h1>
        {posts.length > 0 && (
          <button
            onClick={handleClearAll}
            className="w-10 h-10 flex items-center justify-center text-[#999999] hover:text-[#FA5151] transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="h-48 bg-gradient-to-r from-[#07C160] to-[#06AD56] relative">
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className="text-white text-lg font-medium">{USER_NICKNAME}</span>
          <div className="w-16 h-16 rounded border-2 border-white/30 overflow-hidden bg-white">
            <img
              src={USER_AVATAR}
              alt={USER_NICKNAME}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-4">
        {posts.length === 0 ? (
          <EmptyMoment onPublish={handlePublish} />
        ) : (
          <div className="divide-y divide-[#E6E6E6]">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                {post.isActive && (
                  <div className="absolute top-3 right-14 z-10">
                    <button
                      onClick={() => handleEndSimulation(post.id)}
                      className="px-3 py-1 bg-[#FA5151] text-white text-xs rounded-full hover:bg-[#E64646] transition-colors"
                    >
                      结束模拟
                    </button>
                  </div>
                )}

                {!post.isActive && (
                  <div className="absolute top-3 right-14 z-10">
                    <span className="px-3 py-1 bg-[#999999] text-white text-xs rounded-full">
                      已结束
                    </span>
                  </div>
                )}

                <MomentCard
                  post={post}
                  userAvatar={USER_AVATAR}
                  userNickname={USER_NICKNAME}
                  isLikedByUser={userLikedPosts.has(post.id)}
                  onLike={() => handleLike(post.id)}
                  onCommentClick={(comment) => handleCommentClick(post.id, comment)}
                  newCommentId={newCommentId || undefined}
                />

                {post.isActive &&
                  Array.from(typingStates.values()).map((state) => (
                    <TypingIndicator
                      key={state.personalityId}
                      nickname={state.personality.nickname}
                      avatar={state.personality.avatar}
                      className="pl-16"
                    />
                  ))}
              </div>
            ))}
          </div>
        )}

        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={handlePublish}
            className="w-14 h-14 bg-[#07C160] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#06AD56] transition-colors active:scale-95"
          >
            <Camera className="w-7 h-7" />
          </button>
        </div>
      </div>

      {showCommentInput && activePostId && (
        <BottomCommentInput
          value={commentValue}
          onChange={setCommentValue}
          onSend={handleSendComment}
          placeholder={replyTo ? `回复 ${replyTo.personality.nickname}` : "写评论..."}
          replyTarget={replyTo?.personality.nickname}
          onCancelReply={() => {
            setReplyTo(null);
            setShowCommentInput(false);
          }}
        />
      )}

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>结束本次模拟？</DialogTitle>
            <DialogDescription>
              结束后杠精们将不再评论这条动态。确定要结束吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEndDialog(false)}
            >
              再等等
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmEndSimulation}
            >
              结束
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle>清空所有动态？</DialogTitle>
            <DialogDescription>
              这将清除所有动态记录，杠精评论也会一起消失。确定要清空吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowClearDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmClearAll}
            >
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
