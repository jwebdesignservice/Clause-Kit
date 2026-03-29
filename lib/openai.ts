import OpenAI from "openai";

// Lazy singleton — only instantiated at runtime, never at build time
let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
  }
  return _openai;
}

// Named export for backwards compat — lazy getter
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
