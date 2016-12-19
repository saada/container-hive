require('babel-core/register')
import http from 'http'
import { Server as WebSocketServer } from 'uws'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { docker, runContainer } from './docker'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// setup web socket configuration on top of webserver
const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })

wss.on('connection', function (ws) {
  ws.on('message', message => {
    const parsedMessage = JSON.parse(message)
    switch (parsedMessage.type) {
      case 'run':
        const image = `${parsedMessage.data.image}`
        runContainer(image).then(() => {
          sendMessage('ran', {image})
          ps()
        })
        break
      case 'kill':
        console.log('killing container: ', parsedMessage.data.id)
        const container = docker().getContainer(parsedMessage.data.id)
        container.kill((err, data) => {
          if (err) throw err
          container.remove((err, result) => {
            if (err) throw err
            ps()
          })
        })
        break
      default:
        break
    }
  })

  function sendMessage (type, data) {
    ws.send(JSON.stringify({type, data}))
  }

  // docker ps
  function ps () {
    console.log('docker ps')
    docker().listContainers((err, containers) => {
      if (err) throw err
      sendMessage('ps', containers)
    })
  }

  sendMessage('log', 'server says hey!')
  ps()
})

// start webserver
const PORT = process.env.PORT || 8000
server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}!`)
})
