require('babel-core/register')
import http from 'http'
import { Server as WebSocketServer } from 'uws'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import execa from 'execa'
import { docker, runContainer } from './docker'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// if sysdig is already running, use existing container. Otherwise, start a new one
const sysdigContainerName = 'sysdig_docker_gui'
let sysdigProcess
execa.shell(`docker ps | grep ${sysdigContainerName}`).then(isSysdigRunning => {
  console.info('tailing existing sysdig container')
  sysdigProcess = execa('docker', `logs --tail=0 -f ${sysdigContainerName}`.split(' '))
})
.catch(err => {
  console.error(err)
  console.info('starting a new sysdig container')
  sysdigProcess = execa('docker', `run -t --name ${sysdigContainerName} --rm --privileged -v /var/run/docker.sock:/host/var/run/docker.sock -v /dev:/host/dev -v /proc:/host/proc:ro -v /lib/modules:/host/lib/modules:ro -v /usr:/host/usr:ro -v /usr/bin/docker:/usr/bin/docker:ro mobydig:dev sysdig -pc evt.type=accept`.split(' '))
})

process.on('exit', function () {
  execa.shellSync(`docker rm -f ${sysdigContainerName}`)
})

// setup web socket configuration on top of webserver
const server = http.createServer(app)
const wss = new WebSocketServer({ server: server })

wss.on('connection', function (ws) {
  setInterval(ps, 5000)
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
  // start capturing packets
  sysdigProcess.stdout.on('data', data => {
    const logMessage = data.toString()
    console.log('captured - ', logMessage)
    const ipAddresses = logMessage.match(/\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?/g)
    console.log('matched - ', ipAddresses)
    if (ipAddresses && ipAddresses.length >= 2) {
      sendMessage('networkRequest', {
        from: ipAddresses[0],
        to: ipAddresses[1]
      })
    }
  })

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
