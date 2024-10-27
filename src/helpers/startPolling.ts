import { startPolling } from '@big-whale-labs/botcaster'
import env from './env.js'
import handleNotification from './handleNotification.js'

export default function () {
  startPolling(env.FID, env.NEYNAR_API_KEY, handleNotification)
}
