import { ConversationModel } from '../models/Conversation'
import { CastWithInteractions } from '../../node_modules/@standard-crypto/farcaster-js-neynar/dist/commonjs/v1/openapi/generated/models/cast-with-interactions'
import { SeenCastModel } from '../models/SeenCast'
import bannedUsers from './bannedUsers'
import chatgpt from './chatgpt'
import publishCast from './publishCast'
import env from './env'

function delay(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

export default async function (notification: CastWithInteractions) {
  let castHash: string | undefined
  try {
    // Check if valid
    if (
      notification.type !== 'cast-mention' &&
      notification.type !== 'cast-reply' &&
      +notification.author.fid !== env.FID &&
      !bannedUsers.includes(+notification.author.fid) &&
      !!notification.text &&
      !!notification.hash
    ) {
      console.log('Cannot process notification', notification)
      return
    }
    castHash = notification.hash
    // Get thread hash
    const threadHash = notification.threadHash || notification.hash
    // Check if we've seen this notification
    const dbCast = await SeenCastModel.findOne({
      hash: notification.hash,
    })
    if (dbCast) {
      return
    }
    await SeenCastModel.create({
      hash: notification.hash,
    })
    if (
      new Date(notification.timestamp).getTime() <
      Date.now() - 1000 * 60 * 60 * 24
    ) {
      return
    }
    // Get response
    const conversation = await ConversationModel.findOne({
      threadHash,
    })
    let { text: response, id: messageId } = await chatgpt.sendMessage(
      `Write a knowledgeable reply to the following message: "${notification.text}"`,
      {
        parentMessageId: conversation?.currentParentMessageId,
      }
    )
    let numberOfTries = 0
    while ((!response || response.length > 320) && numberOfTries < 10) {
      if (numberOfTries > 0) {
        console.log('======')
        console.log(response.length, response)
        console.log(`Try #${numberOfTries + 1} for "${notification.text}"`)
        await delay(15)
      }
      numberOfTries++
      const newResponse = await chatgpt.sendMessage(
        `Write a knowledgeable reply to the following message: "${notification.text}"`,
        {
          parentMessageId: conversation?.currentParentMessageId,
        }
      )
      response = newResponse.text
      messageId = newResponse.id
    }
    console.log(response, messageId)
    await ConversationModel.updateOne(
      {
        threadHash,
      },
      {
        currentParentMessageId: messageId,
      },
      {
        upsert: true,
      }
    )
    console.log('======')
    console.log('threadHash', threadHash)
    console.log(notification.text)
    console.log(response.length, response)

    response = response.trim()
    if (response.length <= 320) {
      return publishCast(response, notification.hash)
    } else {
      return publishCast(
        'I tried 10 times to generate a reply under 320 characters but failed. So sorry, try again later!',
        castHash
      )
    }
  } catch (error) {
    console.log(error instanceof Error ? error.message : error)
    if (castHash) {
      const errorMessage = error instanceof Error ? error.message : error
      if (`${errorMessage}`.includes('127.0.0.1:27017')) {
        return
      }
      return publishCast(
        `So sorry, I experienced an error, try again later: ${
          error instanceof Error ? error.message : error
        }`.substring(0, 320),
        castHash
      )
    }
  }
}
