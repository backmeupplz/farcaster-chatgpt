import { ChatGPTAPI } from 'chatgpt'
import env from './env'

export default new ChatGPTAPI({
  apiKey: env.OPEN_AI_API_KEY,
})
