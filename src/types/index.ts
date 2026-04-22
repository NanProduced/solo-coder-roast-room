export type PersonalityType = "挑刺专家" | "键盘侠" | "过分敏感者" | "杠精" | "负能量王" | "炫耀帝" | "直男癌" | "圣母" | "柠檬精" | "道德绑架者";

export interface Personality {
  id: string;
  name: string;
  type: PersonalityType;
  avatar: string;
  nickname: string;
  description: string;
  behavior: {
    commentDelay: [number, number];
    likeProbability: number;
    replyProbability: number;
    backdownProbability: number;
    followUpCommentDelay: [number, number];
  };
  tone: string;
  keywords: string[];
  examples: string[];
}

export interface Comment {
  id: string;
  postId: string;
  personalityId: string;
  personality: Personality;
  content: string;
  timestamp: number;
  isUser: boolean;
  replyTo?: {
    id: string;
    nickname: string;
    content: string;
  };
}

export interface Like {
  id: string;
  personalityId: string;
  personality: Personality;
  timestamp: number;
}

export interface Post {
  id: string;
  content: string;
  images: string[];
  timestamp: number;
  comments: Comment[];
  likes: Like[];
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  personality?: Personality;
}
