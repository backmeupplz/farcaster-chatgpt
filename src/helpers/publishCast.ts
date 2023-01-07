import { MerkleAPIClient } from '@standard-crypto/farcaster-js'
import wallet from './wallet'

const client = new MerkleAPIClient(wallet)

export default async function (text: string, replyToId: string) {
  const cast = await client.fetchCast(replyToId)
  console.log('Publishing cast', text, cast?.hash)
  const publishedCast = await client.publishCast(text, cast)
  return publishedCast.hash
}
