export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID || "agent",
    langgraphUrl: process.env.LANGGRAPH_API_URL,
    langsmithKey: process.env.LANGSMITH_API_KEY,
  },
  ziion: {
    managerPath: process.env.ZIION_MANAGER_PATH || "/Users/rose/Desktop/hacker-ai/scripts/ziion_manager.sh",
  }
};
