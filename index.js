const Docker = require('dockerode')
const docker = new Docker()

const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())


app.get('/', function (req, res) {
  res.send('Hello World!')
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
