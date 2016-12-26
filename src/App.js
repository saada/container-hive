import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
// import ContainerList from './ContainerList'
import HexGrid from './HexGrid'
import WebSocket from 'reconnecting-websocket'
import _ from 'lodash'

class App extends Component {
  constructor () {
    super()
    this.getSelectedImage = this.getSelectedImage.bind(this)
    this.runContainer = this.runContainer.bind(this)
    this.state = {
      err: null,
      ws: new WebSocket('ws://localhost:8000'),
      containers: [],
      networkRequests: [],
      runStatus: false
    }
  }

  componentDidMount () {
    const { ws } = this.state
    ws.addEventListener('open', () => {
      console.info('Websocket connected')
      this.setState({err: null})
    })
    ws.onerror = (err) => {
      if (err.code === 'EHOSTDOWN') {
        console.info('server down')
      }
    }
    ws.onmessage = event => {
      this.handleMessage(event.data)
    }
    ws.onclose = () => {
      console.info('Websocket disconnected')
      this.setState({err: 'Could not connect to server'})
    }
  }

  componentWillReceiveProps (nextProps) {
    // nextProps.psFetch.catch(err => {
    //   console.log(err)
    //   this.setState({err: 'Server is down! Make sure Docker is running and try starting the server with `npm run start-server`.'})
    // })
  }

  runContainer (image) {
    this.sendMessage('run', {image: this.getSelectedImage()})
    this.setState({runStatus: true})
  }

  killContainer (id) {
    this.sendMessage('kill', {id})
  }

  getSelectedImage () {
    return this.refs.selectedImage.value
  }

  getStatus () {
    if (this.state.runStatus) {
      return <p>Pulling and creating new {this.getSelectedImage()} container...</p>
    } else {
      return null
    }
  }

  getContainerIdsOfNetworkRequest (networkRequest) {
    return this.state.containers.reduce((acc, container) => {
      _.forIn(container.NetworkSettings.Networks, network => {
        if (network.IPAddress === networkRequest.from) {
          acc.from = container.Id
        } else if (network.IPAddress === networkRequest.to) {
          acc.to = container.Id
        }
      })
      return acc
    }, {from: null, to: null})
  }

  handleMessage (message) {
    // console.log('ws message - ', message)
    const parsedMessage = JSON.parse(message)
    switch (parsedMessage.type) {
      case 'ps':
        this.setState({runStatus: false, containers: parsedMessage.data})
        break
      case 'networkRequest':
        const containerIds = this.getContainerIdsOfNetworkRequest(parsedMessage.data)
        if (containerIds.from && containerIds.to) {
          const id = `net${Date.now()}`
          // console.log('add network request', id)
          this.setState({networkRequests: [...this.state.networkRequests, {id, request: {...containerIds}}]})
        }
        break
      default:
        break
    }
  }

  sendMessage (type, data) {
    console.log('ws send - ', type, data)
    this.state.ws.send(JSON.stringify({type, data}))
  }

  removeNetworkRequest (id) {
    // console.log('rem network request', id)
    const indexToRemove = _.findIndex(this.state.networkRequests, {id})
    this.setState({networkRequests: [
      ...this.state.networkRequests.slice(0, indexToRemove),
      ...this.state.networkRequests.slice(indexToRemove + 1)
    ]})
  }

  render () {
    return (
      <div>
        <div className='App'>
          <div className='App-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <h2>Container Hive</h2>
          </div>
          <h2 style={{color: 'red'}}>{this.state.err}</h2>
          {/*
          <ContainerList containers={this.state.containers} kill={this.killContainer.bind(this)} networkRequest={this.state.networkRequest} />
          <select ref='selectedImage'>
            <option>library/redis</option>
            <option>library/nginx</option>
          </select>
          <button onClick={this.runContainer}>Add Container</button>
          {this.getStatus()}
          */}
        </div>
        <HexGrid containers={this.state.containers} networkRequests={this.state.networkRequests} removeNetworkRequest={this.removeNetworkRequest.bind(this)}/>
        {/*
        <Hive containers={
          [
            {Id: 1, Image: 'apple'},
            {Id: 2, Image: 'orange'},
            {Id: 3, Image: 'carrot'},
            {Id: 4, Image: 'bee'},
            {Id: 5, Image: 'bee'},
            {Id: 6, Image: 'honey'},
            {Id: 7, Image: 'honey'},
            {Id: 8, Image: 'honey'},
            {Id: 9, Image: 'queen'}
          ]
        } />
        */}
      </div>
    )
  }
}

export default App
