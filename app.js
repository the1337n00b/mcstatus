#!/usr/bin/env node
const status = require('./mcstatus.js')

async function main(){
  let args = require('minimist')(process.argv.slice(2))
  await status(args)
}
main()