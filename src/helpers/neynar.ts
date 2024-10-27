import env from './env'
import { NeynarAPIClient } from '@neynar/nodejs-sdk'

export default new NeynarAPIClient(env.NEYNAR_API_KEY)
