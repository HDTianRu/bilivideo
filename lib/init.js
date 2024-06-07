import setLog from './log.js'
import fs from 'node:fs'

async function checkInit () {
  if (!fs.existsSync('./node_modules')) {
    console.log('Please run command "pnpm install -P" to install dependencies at frist')
    process.exit()
  }
  if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output')
  }
  setLog()
}

process.on('unhandledRejection', (error, promise) => {
  let err = error
  if (logger) {
    logger.error(err)
  } else {
    console.log(err)
  }
})

await checkInit()
