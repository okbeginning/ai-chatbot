import { tool } from "ai";
import { z } from "zod";
import { runWritingAgent } from "../agents/writing-agent";

export const delegateToWritingAgent = tool({
  description:
    "Delegate writing and content creation tasks to a specialized writing agent. Use this for drafting documents, creative writing, editing and improving text, emails, reports, or any structured content creation.",
  inputSchema: z.object({
    task: z
      .string()
      .describe(
        "The writing task or content creation request for the writing agent to handle"
      ),
  }),
  execute: async ({ task }) => {
    const result = await runWritingAgent(task);
    return { result, agent: "writing" };
  },
});
