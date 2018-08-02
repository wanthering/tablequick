#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')

program.usage('<project-name>')
let projectName = program.args

console.log(program)