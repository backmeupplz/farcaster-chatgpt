import chatgpt from './helpers/chatgpt'
import runMongo from './helpers/mongo'
import startPolling from './helpers/startPolling'

void (async () => {
  console.log('Starting mongo')
  await runMongo()
  console.log('Mongo connected')
  await chatgpt.initSession()
  console.log('ChatGPT session initialized')
  await startPolling()
  console.log('App started')
})()
