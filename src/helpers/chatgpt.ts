import { ChatGPTAPIBrowser } from 'chatgpt'
import env from './env'

export default new ChatGPTAPIBrowser({
  email: env.OPEN_AI_USERNAME,
  password: env.OPEN_AI_PASSWORD,
  markdown: false,
  captchaToken: env.TWO_CAPTCHA_TOKEN,
})
