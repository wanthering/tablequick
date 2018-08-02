#! /usr/bin/env node
const program = require('commander')
const path = require('path')
const tableCreate = require('../lib/yamlcreate.js')
const createConfig = require('../lib/createconfig.js')

program
  .version('1.0.0')
  .usage('<command>tablequick')
  .command('create <table>')
  .action(function(table){
    tableCreate(table)
  })

program.command('config')
  .action(function(){
    createConfig()
  })



program.parse(process.argv)