import { generateText } from "ai";
import { getLanguageModel } from "@/lib/ai/providers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { regularPrompt } from "@/lib/ai/prompts";
import {
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { convertToUIMessages, generateUUID } from "@/lib/utils";

export const maxDuration = 60;

function getApiKey(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

function isValidApiKey(key: string): boolean {
  const validKey = process.env.REMOTE_CONTROL_API_KEY;
  if (!validKey) {
    return false;
  }
  return key === validKey;
}

export async function POST(request: Request) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return Response.json(
      { error: "Missing or malformed Authorization header. Use: Bearer <api-key>" },
      { status: 401 }
    );
  }

  if (!isValidApiKey(apiKey)) {
    return Response.json(
      { error: "Invalid API key." },
      { status: 403 }
    );
  }

  let body: { message: string; chatId?: string; model?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { message, chatId: providedChatId, model } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json(
      { error: "Request body must include a non-empty 'message' string." },
      { status: 400 }
    );
  }

  const selectedModel = model ?? DEFAULT_CHAT_MODEL;
  const chatId = providedChatId ?? generateUUID();

  try {
    const existingChat = await getChatById({ id: chatId });

    if (!existingChat) {
      await saveChat({
        id: chatId,
        userId: "remote-control",
        title: message.slice(0, 50),
        visibility: "private",
      });
    }

    const previousMessages = existingChat
      ? await getMessagesByChatId({ id: chatId })
      : [];

    const userMessageId = generateUUID();

    await saveMessages({
      messages: [
        {
          chatId,
          id: userMessageId,
          role: "user",
          parts: [{ type: "text", text: message }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const uiMessages = convertToUIMessages(previousMessages);
    const historyMessages = uiMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(""),
    }));

    const { text } = await generateText({
      model: getLanguageModel(selectedModel),
      system: regularPrompt,
      messages: [
        ...historyMessages,
        { role: "user", content: message },
      ],
    });

    const assistantMessageId = generateUUID();

    await saveMessages({
      messages: [
        {
          chatId,
          id: assistantMessageId,
          role: "assistant",
          parts: [{ type: "text", text }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    return Response.json(
      {
        chatId,
        userMessageId,
        assistantMessageId,
        role: "assistant",
        content: text,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remote control API error:", error);
    return Response.json(
      { error: "Failed to process request. Please try again later." },
      { status: 503 }
    );
  }
}
