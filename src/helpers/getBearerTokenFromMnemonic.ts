import { MerkleAPIClient } from '@standard-crypto/farcaster-js'
import { Wallet } from 'ethers'

export default async function (mnemonic: string) {
  const wallet = Wallet.fromMnemonic(mnemonic)
  const client = new MerkleAPIClient(wallet)
  console.log('Creating 5 auth tokens that expire long time in the future...')
  const tokens = await Promise.all(
    Array.from(Array(5).keys()).map(() =>
      // go for the a very big expiry to make sure they have longer expiry than all existing tokens
      client.createAuthToken(109999999999999)
    )
  )
  console.log(`Revoking ${tokens.length} tokens...`)
  await Promise.all(tokens.map((token) => client.revokeAuthToken(token)))
  console.log('Revoked all tokens!')
  return client.createAuthToken(50 * 365 * 24 * 60 * 60 * 1000)
}
