import { MerkleAPIClient } from '@standard-crypto/farcaster-js'
import { Wallet } from 'ethers'

export default async function (
  text: string,
  replyToId: string,
  mnemonic: string
) {
  const wallet = Wallet.fromMnemonic(mnemonic)
  const client = new MerkleAPIClient(wallet)
  const cast = await client.fetchCast(replyToId)
  console.log('Publishing cast', text, cast?.hash)
  const publishedCast = await client.publishCast(text, cast)
  return publishedCast.hash
}
