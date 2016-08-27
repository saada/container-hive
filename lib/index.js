require('babel-core/register')
import express from 'express'
import cors from 'cors'
import Docker from 'dockerode'
import bodyParser from 'body-parser'

let docker
function getDockerConnection () {
  docker = docker || new Docker()
  return docker
}

function startContainer (image) {
  return new Promise((resolve, reject) => {
    getDockerConnection().createContainer({Image: image}, (err, container) => {
      if (err) return reject(err)
      console.log('starting image: ', image)
      container.start((err, data) => {
        console.log('started image: ', image)
        if (err) return reject(err)
        resolve(data)
      })
    })
  })
}

function pullImage (image) {
  return new Promise((resolve, reject) => {
    image = addLatestTag(image)

    getDockerConnection().pull(image, (err, stream) => {
      if (err) return reject(err)
      getDockerConnection().modem.followProgress(stream, (err, output) => {
        if (err) return reject(err)
        console.log('completed pull: ', image, 'output: ', output)
        resolve(image)
      })
    })
  })
}

function addLatestTag (image) {
  if (image.indexOf(':') > -1) {
    return image
  }

  return `${image}:latest`
}

function runContainer (image) {
  return new Promise(resolve => {
    console.log('pulling image: ', image)
    pullImage(image)
      .then(startContainer)
      .then(resolve)
  })
}

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/run', (req, res) => {
  const image = `${req.body.image}`
  runContainer(image).then(() => { 
    res.send({message: 'success'})
  })
})

app.post('/kill', (req, res) => {
  console.log('killing container: ', req.body.id)
  const container = getDockerConnection().getContainer(req.body.id)
  container.kill((err, data) => {
    if (err) throw err
    container.remove((err, result) => {
      if (err) throw err
      res.send({message: 'success', data: result})
    })
  })
})

app.get('/ps', (req, res) => {
  getDockerConnection().listContainers((err, containers) => {
    if (err) throw err
    res.send(JSON.stringify(containers))
  })
})

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})
