import { tool } from "ai";
import { z } from "zod";
import { runResearchAgent } from "../agents/research-agent";

export const delegateToResearchAgent = tool({
  description:
    "Delegate research and information-gathering tasks to a specialized research agent. Use this for factual questions, topic deep-dives, comparative analyses, or when thorough research is needed to provide a comprehensive answer.",
  inputSchema: z.object({
    task: z
      .string()
      .describe(
        "The research question or task for the research agent to investigate"
      ),
  }),
  execute: async ({ task }) => {
    const result = await runResearchAgent(task);
    return { result, agent: "research" };
  },
});
