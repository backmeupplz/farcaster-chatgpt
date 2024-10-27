import runMongo from './helpers/mongo.js'
import startPolling from './helpers/startPolling.js'

void (async () => {
  console.log('Starting mongo')
  await runMongo()
  console.log('Mongo connected')
  await startPolling()
  console.log('App started')
})()
