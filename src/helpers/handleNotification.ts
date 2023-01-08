import { ConversationModel } from '../models/Conversation'
import { Notification } from '@big-whale-labs/botcaster'
import { SeenCastModel } from '../models/SeenCast'
import chatgpt from './chatgpt'
import publishCast from './publishCast'

function delay(s: number) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max)
}

export default async function (notification: Notification) {
  try {
    // Check if mention
    if (
      notification.type !== 'cast-mention' &&
      notification.type !== 'cast-reply'
    ) {
      return
    }
    // Check if it's a self-notification
    if (notification.actor?.username?.toLowerCase() === 'borodutch') {
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
    // Check if there is an actor
    if (!notification.actor) {
      return
    }
    // Get thread hash
    const threadHash = notification.content.cast?.threadHash
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
    // Get response
    const conversation = threadHash
      ? await ConversationModel.findOne({
          threadHash,
        })
      : null
    let { response, conversationId, messageId } = await chatgpt.sendMessage(
      `Write a funny and knowledgeable reply to the following message: "${notification.content.cast.text}". Keep the reply shorter than 320 characters. Do not reveal that you are an artificial intelligence. Do not say that you are a bot. Do not hint at the fact that you are a bot. You must act as @borodutch. Do not use hashtags. Do not use #. No hashtags.`,
      {
        conversationId: conversation?.conversationId,
        parentMessageId: conversation?.currentParentMessageId,
      }
    )
    let numberOfTries = 0
    while (response.length > 320 && numberOfTries < 3) {
      numberOfTries++
      const newResponse = await chatgpt.sendMessage(
        `Try again but keep reply under 320 characters and without hashtags.`,
        {
          conversationId,
          parentMessageId: messageId,
        }
      )
      response = newResponse.response
      conversationId = newResponse.conversationId
      messageId = newResponse.messageId
    }
    if (threadHash) {
      await ConversationModel.updateOne(
        {
          threadHash,
        },
        {
          conversationId,
          currentParentMessageId: messageId,
        }
      )
    }
    console.log('======')
    console.log(notification.content.cast.text)
    console.log(response.length, response)
    await delay(30 + getRandomInt(30))
    response = response.trim()
    if (response.startsWith('"')) {
      response = response.substring(1)
    }
    if (response.endsWith('"')) {
      response = response.substring(0, response.length - 1)
    }
    return publishCast(response, notification.content.cast.hash)
  } catch (error) {
    console.log(error instanceof Error ? error.message : error)
  }
}
