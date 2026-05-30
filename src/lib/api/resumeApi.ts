import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildSystemPrompt } from "../../prompts/masterPrompt";
import { MODEL, MAX_TOKENS } from "../config";
import type { ResumeJSON } from "../../types/resume";

export const generateResume = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    jd: z.string().min(50),
    includeCoverLetter: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) throw new Error("OPENAI_API_KEY not set in environment.");

    const userMessage = `JD:\n${data.jd.trim()}\n\ncover_letter: ${data.includeCoverLetter}\n\nGenerate the tailored resume JSON now.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userMessage },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data2 = await response.json() as { choices: { message: { content: string } }[] };
    const raw = data2.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from OpenAI.");

    const resume = JSON.parse(raw) as ResumeJSON;
    return { resume };
  });
