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
      mode: 2,
      focus: false,
      // spring configs
      stiffness: 150,
      damping: 30
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

    // add keyboard listeners
    window.document.addEventListener('keydown', e => this.maxPayneMode(e))

    // disable system when tab is not focused
    window.addEventListener('blur', e => {
      this.setState({focus: false})
    })
    window.addEventListener('focus', e => {
      this.setState({focus: true})
    })
  }

  /**
   * Control animation speed with keyboard controls
   */
  maxPayneMode (e) {
    const { keyCode } = e
    const { stiffness } = this.state
    switch (keyCode) {
      case 37: // left
      case 40: // down
        e.preventDefault()
        const newStiffness = stiffness - 5
        this.setState({stiffness: newStiffness})
        break
      case 38: // up
      case 39: // right
        e.preventDefault()
        this.setState({stiffness: stiffness + 5})
        break
      case 32: // space
        e.preventDefault()
        this.setState({stiffness: stiffness === 0 ? 150 : 0})
        break
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
        // perf optimization: ignore network requests if in blur mode or animations are paused
        if (this.state.stiffness === 0 || !this.state.focus) {
          break
        }

        const containerIds = this.getContainerIdsOfNetworkRequest(parsedMessage.data)
        if (containerIds.from && containerIds.to) {
          const id = `net${Date.now()}`
          // console.log('add network request', id)
          this.setState({networkRequests: [...this.state.networkRequests, {id, request: {...containerIds}}]})
          setTimeout(() => this.removeNetworkRequest(id), 400)
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
    return <HexGrid containers={this.state.containers} networkRequests={this.state.networkRequests} removeNetworkRequest={this.removeNetworkRequest.bind(this)} stiffness={this.state.stiffness} damping={this.state.damping} />
  }

  render () {
    const ModeButton = {width: 'auto', border: 'none', borderRadius: '99px', padding: '10px', backgroundColor: 'lightgreen', margin: '0 15px'}
    const ActiveModeButton = {...ModeButton, border: 'solid'}
    return (
      <div>
        <div className='App'>
          <p style={{position: 'absolute', right: '10px'}}>Stiffness: {this.state.stiffness}</p>
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
