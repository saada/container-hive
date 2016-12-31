import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import ContainerList from './ContainerList'
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
      runStatus: false,
      mode: 1
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

  renderMode1 () {
    return <div>
      <ContainerList containers={this.state.containers} kill={this.killContainer.bind(this)} networkRequests={this.state.networkRequests} removeNetworkRequest={this.removeNetworkRequest.bind(this)} />
      <select ref='selectedImage'>
        <option>library/redis</option>
        <option>library/nginx</option>
      </select>
      <button onClick={this.runContainer}>Add Container</button>
      {this.getStatus()}
    </div>
  }

  renderMode2 () {
    return <HexGrid containers={this.state.containers} networkRequests={this.state.networkRequests} removeNetworkRequest={this.removeNetworkRequest.bind(this)} />
  }

  render () {
    const ModeButton = {width: 'auto', border: 'none', borderRadius: '99px', padding: '10px', backgroundColor: 'lightgreen', margin: '0 15px'}
    const ActiveModeButton = {width: 'auto', border: 'solid', borderRadius: '99px', padding: '10px', backgroundColor: 'lightgreen', margin: '0 15px'}
    return (
      <div>
        <div className='App'>
          <div className='App-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <h2>Container Hive</h2>
            <button style={this.state.mode === 1 ? ActiveModeButton : ModeButton} onClick={() => this.setState({mode: 1})}>
              Mode 1
            </button>
            <button style={this.state.mode === 2 ? ActiveModeButton : ModeButton} onClick={() => this.setState({mode: 2})}>
              Mode 2
            </button>
          </div>
          <h2 style={{color: 'red'}}>{this.state.err}</h2>
          {this.state.mode === 1 ? this.renderMode1() : null}
          {this.state.mode === 2 ? this.renderMode2() : null}
        </div>
      </div>
    )
  }
}

export default App
