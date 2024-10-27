import { startPolling } from '@big-whale-labs/botcaster'
import env from './env'
import handleNotification from './handleNotification'

export default function () {
  startPolling(env.FID, env.NEYNAR_API_KEY, handleNotification, true)
}
