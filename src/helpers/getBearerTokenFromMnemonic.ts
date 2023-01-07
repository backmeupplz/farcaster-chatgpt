import { MerkleAPIClient } from '@standard-crypto/farcaster-js'
import { Wallet } from 'ethers'

export default function (mnemonic: string) {
  const wallet = Wallet.fromMnemonic(mnemonic)
  const client = new MerkleAPIClient(wallet)
  return client.createAuthToken(50 * 365 * 24 * 60 * 60 * 1000)
}
