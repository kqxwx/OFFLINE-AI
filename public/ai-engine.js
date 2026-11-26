import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
let enginePromise = null;
let engineInstance = null;

window.offlineAIEngine = {
  modelId: MODEL_ID,
  async load(onProgress) {
    if (engineInstance) return engineInstance;
    if (!navigator.gpu) throw new Error("В этом браузере не найден WebGPU. Открой приложение в актуальном Safari на iPhone или Chrome/Edge на компьютере.");
    if (!enginePromise) {
      enginePromise = CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          if (onProgress) onProgress({
            progress: Math.max(0, Math.min(1, report.progress || 0)),
            text: report.text || "Подготовка модели…"
          });
        }
      }).then((engine) => {
        engineInstance = engine;
        return engine;
      }).catch((error) => {
        enginePromise = null;
        throw error;
      });
    }
    return enginePromise;
  },
  async reply(messages, onToken, mode) {
    if (!engineInstance) throw new Error("Сначала установи локальную модель.");
    const history = [
      { role: "system", content: "Ты OFFLINE AI — полезный, честный и внимательный русскоязычный помощник. Отвечай по-русски, если пользователь не попросил другой язык. Объясняй ясно и конкретно. Не выдумывай факты. Если не знаешь — скажи прямо. Не утверждай, что у тебя есть доступ к интернету или устройству." },
      ...messages.slice(-16).map((message) => ({ role: message.role, content: message.text }))
    ];
    const stream = await engineInstance.chat.completions.create({
      messages: history,
      temperature: mode === "deep" ? 0.45 : 0.7,
      max_tokens: mode === "deep" ? 900 : 600,
      stream: true
    });
    let answer = "";
    for await (const part of stream) {
      const token = part.choices?.[0]?.delta?.content || "";
      if (token) {
        answer += token;
        if (onToken) onToken(answer);
      }
    }
    return answer;
  }
};
