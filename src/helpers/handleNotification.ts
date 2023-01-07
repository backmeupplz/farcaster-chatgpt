import { Notification } from '@big-whale-labs/botcaster'
import { SeenCastModel } from '../models/SeenCast'
import chatgpt from './chatgpt'
import publishCast from './publishCast'

export default async function (notification: Notification) {
  try {
    // Check if mention
    console.log(notification.type)
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
    const { response } = await chatgpt.sendMessage(
      `Write a funny and ironic reply to the following message: "${notification.content.cast.text}". Keep the reply under 320 characters.`
    )
    console.log('======')
    console.log(notification.content.cast.text)
    console.log(response.length, response)
    return publishCast(response, notification.content.cast.hash)
  } catch (error) {
    console.log(error instanceof Error ? error.message : error)
  }
}
