import { tool } from "ai";
import { z } from "zod";
import { runCodeAgent } from "../agents/code-agent";

export const delegateToCodeAgent = tool({
  description:
    "Delegate programming and software engineering tasks to a specialized code agent. Use this for code generation, debugging, code explanation, algorithm design, or any technical implementation questions.",
  inputSchema: z.object({
    task: z
      .string()
      .describe(
        "The coding task, programming question, or technical problem for the code agent to solve"
      ),
  }),
  execute: async ({ task }) => {
    const result = await runCodeAgent(task);
    return { result, agent: "code" };
  },
});
