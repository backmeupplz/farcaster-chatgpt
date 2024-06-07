import { NeynarAPIClient } from '@standard-crypto/farcaster-js'
import env from './env'

export default new NeynarAPIClient(env.NEYNAR_API_KEY)
