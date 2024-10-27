import env from './env.js'
import neynar from './neynar.js'

export default async function (text: string, replyTo: string) {
  console.log('Publishing cast', text)
  const cast = await neynar.publishCast(env.NEYNAR_SIGNER_UUID, text, {
    replyTo: replyTo,
  })
  return cast.hash
}
