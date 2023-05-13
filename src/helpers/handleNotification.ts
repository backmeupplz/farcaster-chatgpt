import { ConversationModel } from '../models/Conversation'
import { Notification } from '@big-whale-labs/botcaster'
import { SeenCastModel } from '../models/SeenCast'
import bannedUsers from './bannedUsers'
import chatgpt from './chatgpt'
import publishCast from './publishCast'

function delay(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

export default async function (notification: Notification, mnemonic: string) {
  let castHash: string | undefined
  try {
    // Check if mention
    if (
      notification.type !== 'cast-mention' &&
      notification.type !== 'cast-reply'
    ) {
      return
    }
    // Check if it's a self-notification
    if (notification.actor?.username?.toLowerCase() === 'chatgpt') {
      return
    }
    // Check if banned
    if (
      bannedUsers.includes(notification.actor?.username?.toLowerCase() || '')
    ) {
      return
    }
    // Check if it has text
    const mentionText = notification.content.cast?.text
    if (!mentionText) {
      return
    }
    // Check if it has a hash
    if (!notification.content.cast?.hash) {
      return
    }
    castHash = notification.content.cast.hash
    // Check if there is an actor
    if (!notification.actor) {
      return
    }
    // Get thread hash
    const threadHash =
      notification.content.cast?.threadHash || notification.content.cast.hash
    // Check if we've seen this notification
    const dbCast = await SeenCastModel.findOne({
      hash: notification.content.cast.hash,
    })
    if (dbCast) {
      return
    }
    await SeenCastModel.create({
      hash: notification.content.cast.hash,
    })
    if (
      notification.content.cast.timestamp <
      Date.now() - 1000 * 60 * 60 * 24
    ) {
      return
    }
    // Get response
    const conversation = await ConversationModel.findOne({
      threadHash,
    })
    let { text: response, id: messageId } = await chatgpt.sendMessage(
      `Write a knowledgeable reply to the following message: "${notification.content.cast.text}"`,
      {
        parentMessageId: conversation?.currentParentMessageId,
      }
    )
    let numberOfTries = 0
    while ((!response || response.length > 320) && numberOfTries < 10) {
      if (numberOfTries > 0) {
        console.log('======')
        console.log(response.length, response)
        console.log(
          `Try #${numberOfTries + 1} for "${notification.content.cast.text}"`
        )
        await delay(15)
      }
      numberOfTries++
      const newResponse = await chatgpt.sendMessage(
        `Write a knowledgeable reply to the following message: "${notification.content.cast.text}"`,
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
    console.log(notification.content.cast.text)
    console.log(response.length, response)

    response = response.trim()
    if (response.length <= 320) {
      return publishCast(response, notification.content.cast.hash, mnemonic)
    } else {
      return publishCast(
        'I tried 10 times to generate a reply under 320 characters but failed. So sorry, try again later!',
        castHash,
        mnemonic
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
        castHash,
        mnemonic
      )
    }
  }
}
