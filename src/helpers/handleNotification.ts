import { ConversationModel } from '../models/Conversation.js'
import { SeenCastModel } from '../models/SeenCast.js'
import bannedUsers from './bannedUsers.js'
import chatgpt from './chatgpt.js'
import publishCast from './publishCast.js'
import env from './env.js'
import { Notification } from '@neynar/nodejs-sdk/build/neynar-api/v2'

function delay(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

export default async function (notification: Notification) {
  let castHash: string | undefined
  try {
    // Check if valid
    if (
      !notification.cast ||
      (notification.type !== 'mention' &&
        notification.type !== 'reply' &&
        +notification.cast.author.fid !== env.FID &&
        !bannedUsers.includes(+notification.cast.author.fid) &&
        !!notification.cast.text &&
        !!notification.cast.hash)
    ) {
      console.log('Cannot process notification', notification.type)
      return
    }
    castHash = notification.cast.hash
    // Get thread hash
    const threadHash = notification.cast.thread_hash || notification.cast.hash
    // Check if we've seen this notification
    const dbCast = await SeenCastModel.findOne({
      hash: notification.cast.hash,
    })
    if (dbCast) {
      return
    }
    await SeenCastModel.create({
      hash: notification.cast.hash,
    })
    if (
      new Date(notification.cast.timestamp).getTime() <
      Date.now() - 1000 * 60 * 60 * 24
    ) {
      console.log('Old cast, skipping,', notification.type)
      return
    }
    // Get response
    const conversation = await ConversationModel.findOne({
      threadHash,
    })
    let { text: response, id: messageId } = await chatgpt.sendMessage(
      `Write a knowledgeable reply to the following message: "${notification.cast.text}"`,
      {
        parentMessageId: conversation?.currentParentMessageId,
      }
    )
    let numberOfTries = 0
    while ((!response || response.length > 1024) && numberOfTries < 10) {
      if (numberOfTries > 0) {
        console.log('======')
        console.log(response.length, response)
        console.log(`Try #${numberOfTries + 1} for "${notification.cast.text}"`)
        await delay(15)
      }
      numberOfTries++
      const newResponse = await chatgpt.sendMessage(
        `Write a knowledgeable reply to the following message: "${notification.cast.text}"`,
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
    console.log(notification.cast.text)
    console.log(response.length, response)

    response = response.trim()
    if (response.length <= 1024) {
      return publishCast(response, notification.cast.hash)
    } else {
      return publishCast(
        'I tried 10 times to generate a reply under 1024 characters but failed. So sorry, try again later!',
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
        }`.substring(0, 1024),
        castHash
      )
    }
  }
}
