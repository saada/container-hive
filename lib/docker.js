import { Promise } from 'bluebird'
import Docker from 'dockerode'

export function docker () {
  return new Docker()
}

export function startContainer (image) {
  return new Promise((resolve, reject) => {
    docker().createContainer({Image: image}, (err, container) => {
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

export function pullImage (image) {
  return new Promise((resolve, reject) => {
    image = addLatestTag(image)

    docker().pull(image, (err, stream) => {
      if (err) return reject(err)
      docker().modem.followProgress(stream, (err, output) => {
        if (err) return reject(err)
        console.log('completed pull: ', image, 'output: ', output)
        resolve(image)
      })
    })
  })
}

export function addLatestTag (image) {
  if (image.indexOf(':') > -1) {
    return image
  }

  return `${image}:latest`
}

export function runContainer (image) {
  return new Promise(resolve => {
    console.log('pulling image: ', image)
    pullImage(image)
      .then(startContainer)
      .then(resolve)
  })
}
