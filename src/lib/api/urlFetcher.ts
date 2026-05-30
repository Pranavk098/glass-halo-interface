import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const fetchJDFromUrl = createServerFn({ method: "POST" })
  .inputValidator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    const res = await fetch(data.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ResumeOS/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL (${res.status}). Try pasting the JD text directly.`);
    }

    const html = await res.text();

    // Strip HTML tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Take a generous middle slice — job content is rarely in the first/last 20%
    // Cap at 8000 chars to stay within token budget
    const slice = text.length > 8000 ? text.slice(Math.floor(text.length * 0.1), Math.floor(text.length * 0.1) + 8000) : text;

    return { jdText: slice };
  });
