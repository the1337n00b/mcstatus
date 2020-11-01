#!/usr/bin/env node
const util = require('minecraft-server-util')
var info = {}

async function main(args){
  let mc_cfg = args.config || 'config.json'
  let config = JSON.parse(JSON.stringify(require(`./${mc_cfg}`))) || {}
  let mc_host = args.host || config.host || false
  let mc_port = args.port || config.port || 25565
  let rcon_pw = args.rpass || config.rpass || ''
  let rcon_port = args.rport || config.rport || 25575

  if (!mc_host) {
    console.log ('host not specified')
    process.exit()
  }

  try {
    let status = await util.status(mc_host, {port: mc_port}) // port is optional, defaults to 25565
    info.online = status.onlinePlayers
    info.max = status.maxPlayers
    info.host = status.srvRecord ? status.srvRecord.host : status.host
    info.port = status.srvRecord ? status.srvRecord.port : status.port
    info.players = (status.samplePlayers || []).reduce((prev,curr,ix,arr) => {
      return `${prev} ${curr.name}`.trim()
    },'')

    if (args.debug) console.log(status)
    if (args.status) console.log(`${info.online} of ${info.max} players online (${info.players})`)

    let client
    if (args.cmd) {
      client = new util.RCON(info.host, { port: rcon_port, password: rcon_pw });
      client.on('output', (message) => {
        let cleaned = message.replace(/Â§[\d\w]/g, "") + "\n"
        console.log(cleaned)
        client.close()
        process.exit()
      })

      await client.connect()
      console.log(`\nCONNECTED!\n`)

      if (args.cmd) client.run(args.cmd)
    } else {
      process.exit()
    }

  } catch (error) {
    console.log('error.')
    console.error(error)
  }

}

module.exports = main