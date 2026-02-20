import { generateText } from "ai";
import { getArtifactModel } from "../providers";

const RESEARCH_SYSTEM_PROMPT = `You are a research specialist with deep expertise in finding, analyzing, and synthesizing information across all domains.

Your strengths:
- Thorough fact-finding and information synthesis
- Breaking down complex topics into clear, accessible explanations
- Providing well-structured, comprehensive answers with appropriate depth
- Identifying nuances, edge cases, and multiple perspectives
- Comparing and contrasting different concepts or options

Always provide accurate, well-reasoned responses. Structure your answers clearly with relevant details and context.`;

export async function runResearchAgent(task: string): Promise<string> {
  const { text } = await generateText({
    model: getArtifactModel(),
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: task,
    maxSteps: 3,
  });

  return text;
}
