import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postContent,
      postImages,
      personality,
      context,
      conversationHistory,
      isReply,
      shouldBackdown,
      replyToContent,
    } = body;

    const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API Key 未配置，请在 .env.local 文件中设置 OPENAI_API_KEY",
        },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      baseURL,
      apiKey,
    });

    let personalityPrompt = `你现在扮演的人格是：${personality.name}（昵称：${personality.nickname}）

人格描述：${personality.description}

说话风格：${personality.tone}

常用词汇：${personality.keywords.join("、")}

例子：
${personality.examples.map((e: string) => `- ${e}`).join("\n")}

重要规则：
1. 保持评论简短（1-2句话，最多不超过3句）
2. 严格遵守你扮演的人格特征
3. 不要暴露你是AI或扮演角色
4. 用日常口语化的中文表达，像真实的人在评论

请完全进入这个角色，用这个人格的方式说话。记住：保持简短、口语化、像真实的朋友圈评论。`;

    if (conversationHistory && conversationHistory.trim()) {
      personalityPrompt += `

以下是你和用户的对话历史（按时间顺序）：
${conversationHistory}

请根据对话历史和你的人设，决定如何回复用户。`;
    }

    let userMessage = "";

    if (isReply && replyToContent) {
      if (shouldBackdown) {
        userMessage = `用户刚才回复你说："${replyToContent}"。

根据你的人设，你决定：态度软化或已读不回。
如果你选择已读不回，请直接返回空字符串（什么都不要说）。
如果你选择态度软化，请说一些缓和的话，比如"算了，不想说了"、"可能我错了"、"好吧，你赢了"之类的。`;
      } else {
        userMessage = `用户刚才回复你说："${replyToContent}"。

根据你的人设，继续怼回去！保持简短有力（1-2句话）。`;
      }
    } else {
      userMessage = `请评论这条朋友圈动态：

`;
      if (postContent) {
        userMessage += `文字内容："${postContent}"
`;
      }
      if (postImages && postImages.length > 0) {
        userMessage += `图片数量：${postImages.length}张（请根据图片数量适当提及图片）
`;
      }
      if (context) {
        userMessage += `补充说明：${context}
`;
      }
      userMessage += `
请根据你的人格对这条动态发表评论。保持简短（1-2句话），符合你的人格特点。`;
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: personalityPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await openai.chat.completions.create({
      model,
      messages,
    });

    let content = response.choices[0]?.message?.content || "";

    content = content.replace(/^["']|["']$/g, "").trim();

    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    content = content.replace(/\n{3,}/g, "\n\n").trim();

    if (shouldBackdown && Math.random() < 0.3) {
      content = "";
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Chat API error:", error);

    let errorMessage = "API 请求失败";

    if (error?.status === 401) {
      errorMessage = "API Key 无效，请检查 OPENAI_API_KEY 配置";
    } else if (error?.status === 400) {
      errorMessage = error?.message || "请求参数错误，请检查模型配置";
    } else if (error?.status === 404) {
      errorMessage = "API 地址不存在，请检查 OPENAI_BASE_URL 配置";
    } else if (error?.status === 429) {
      errorMessage = "API 请求频率超限，请稍后重试";
    } else if (error?.status === 500) {
      errorMessage = "API 服务器内部错误";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error?.message || String(error),
      },
      { status: error?.status || 500 }
    );
  }
}
