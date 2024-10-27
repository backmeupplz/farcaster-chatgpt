import env from './env'
import neynar from './neynar'

export default async function (text: string, replyTo: string) {
  console.log('Publishing cast', text)
  const cast = await neynar.publishCast(env.NEYNAR_SIGNER_UUID, text, {
    replyTo: replyTo,
  })
  return cast.hash
}
