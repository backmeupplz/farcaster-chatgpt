import { startPolling } from '@big-whale-labs/botcaster'
import env from './env'
import getBearerTokenFromMnemonic from './getBearerTokenFromMnemonic'
import handleNotification from './handleNotification'

export default async function () {
  const bearerToken = await getBearerTokenFromMnemonic(env.FARCASTER_MNEMONIC)
  console.log('Got bearer token', bearerToken)
  startPolling(bearerToken.secret, (notification) =>
    handleNotification(notification)
  )
}
