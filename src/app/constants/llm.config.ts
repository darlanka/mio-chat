export const LLM_CONFIG = {
  temperature: 0.8,
  maxAttempts: 5,
  freeSuffix: ':free',
  routerModel: 'openrouter/free',
  // Free models rotate, so we rank whatever is available by this preference order.
  preferredFamilies: [/deepseek/, /qwen/, /glm/, /kimi/, /gpt-oss/, /llama-3\.3-70b/, /gemma/, /mistral/],
} as const;
