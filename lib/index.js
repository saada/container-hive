require('babel-core/register')
import express from 'express'
import cors from 'cors'
import Docker from 'dockerode'
import bodyParser from 'body-parser'

const docker = new Docker()
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'))

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.post('/demo', (req, res) => {
  const image = `${req.body.image}`
  console.log('pulling image: ', image)
  docker.pull(image, (err, stream) => {
    if (err) throw err
    docker.createContainer({Image: image}, (err, container) => {
      if (err) throw err
      console.log('starting image: ', image)
      container.start((err, data) => {
        if (err) throw err
        container.attach({stream: true, stdout: true, stderr: true}, (err, stream) => {
          if (err) throw err
          stream.pipe(process.stdout)
        })
        res.send({message: 'success'})
      })
    })
  })
})

app.post('/kill', (req, res) => {
  console.log('killing container: ', req.body.id)
  const container = docker.getContainer(req.body.id)
  container.kill((err, data) => {
    if (err) throw err
    container.remove((err, result) => {
      if (err) throw err
      res.send({message: 'success', data: result})
    })
  })
})

app.get('/ps', (req, res) => {
  docker.listContainers((err, containers) => {
    if (err) throw err
    res.send(JSON.stringify(containers))
  })
})

app.listen(8000, function () {
  console.log('Example app listening on port 8000!')
})
