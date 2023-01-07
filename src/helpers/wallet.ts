import { Wallet } from 'ethers'
import env from './env'

export default Wallet.fromMnemonic(env.FARCASTER_MNEMONIC)
