import * as dotenv from 'dotenv'
import { cleanEnv, num, str } from 'envalid'
import { cwd } from 'process'
import { resolve } from 'path'

dotenv.config({ path: resolve(cwd(), '.env') })

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  MONGO: str(),
  PORT: num({ default: 1337 }),
  FARCASTER_MNEMONIC: str(),
  OPEN_AI_USERNAME: str(),
  OPEN_AI_PASSWORD: str(),
  TWO_CAPTCHA_TOKEN: str(),
})
