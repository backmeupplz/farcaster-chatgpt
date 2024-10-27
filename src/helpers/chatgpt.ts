import { ChatGPTAPI } from 'chatgpt'
import env from './env'

export default new ChatGPTAPI({
  apiKey: env.OPEN_AI_API_KEY,
  completionParams: { model: 'gpt-4o' },
  systemMessage:
    'You are GPT-4o, a large language model trained by OpenAI. Answer as concisely as possible. Keep all the replies shorter than 1024 characters. Do not use hashtags.',
})
