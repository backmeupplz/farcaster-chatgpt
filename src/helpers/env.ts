import * as dotenv from 'dotenv'
import { cleanEnv, num, str } from 'envalid'
import { cwd } from 'process'
import { resolve } from 'path'

dotenv.config({ path: resolve(cwd(), '.env') })

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  MONGO: str(),
  PORT: num({ default: 1337 }),
  FARCASTER_MNEMONIC_CHATGPT: str(),
  FARCASTER_MNEMONIC_GPT: str(),
  OPEN_AI_API_KEY: str(),
})
