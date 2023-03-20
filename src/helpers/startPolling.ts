import { startPolling } from '@big-whale-labs/botcaster'
import env from './env'
import getBearerTokenFromMnemonic from './getBearerTokenFromMnemonic'
import handleNotification from './handleNotification'

export default async function () {
  for (const mnemonic of [
    env.FARCASTER_MNEMONIC_CHATGPT,
    env.FARCASTER_MNEMONIC_GPT,
  ]) {
    const bearerToken = await getBearerTokenFromMnemonic(mnemonic)
    console.log('Got bearer token', bearerToken)
    startPolling(bearerToken.secret, (notification) =>
      handleNotification(notification)
    )
  }
}
