require('babel-core/register')
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

app.post('/run', (req, res) => {
  const image = `${req.body.image}`
  runContainer(image).then(() => {
    res.send({message: 'success'})
  })
})

app.post('/kill', (req, res) => {
  console.log('killing container: ', req.body.id)
  const container = docker().getContainer(req.body.id)
  container.kill((err, data) => {
    if (err) throw err
    container.remove((err, result) => {
      if (err) throw err
      res.send({message: 'success', data: result})
    })
  })
})

app.get('/ps', (req, res) => {
  docker().listContainers((err, containers) => {
    if (err) throw err
    res.send(JSON.stringify(containers))
  })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`)
})
