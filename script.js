#!/usr/bin/env node
const Actions = require('./lib/actions');

const [,, ...args] = process.argv;
let directory = process.cwd().toString();

if(args[0] == 'generate') {
  if(args[1] == 'request') {
    Actions.generateRequest(directory, args[3], args[2])
  } else if(args[1] == 'response') {
    Actions.generateResponse(directory, args[3], args[2])
  } else if(args[1] == 'controller') {
    Actions.generateController(directory, args[3], args[2])
  } else if(args[1] == 'model') {
    Actions.generateModel(directory, args[2])
  } else {
    console.log("Sorry! Command not found!")
  }
} else if(args[0] == 'new') {
  Actions.generateFrameWork(directory, args[1])
} else if(args[0] == 'create') {
  Actions.generateRequest(directory, 'get', args[1])
  Actions.generateResponse(directory, 'get', args[1])
  Actions.generateController(directory, 'get', args[1])
  Actions.generateModel(directory, args[1])
  Actions.generateRoutes(directory, 'get', args[1])
} else {
  console.log("Sorry! Command not found!")
}
