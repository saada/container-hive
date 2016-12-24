import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import ContainerList from './ContainerList'
import Hive from './Hive'
import HexGrid from './HexGrid'
import WebSocket from 'reconnecting-websocket'

class App extends Component {
  constructor () {
    super()
    this.getSelectedImage = this.getSelectedImage.bind(this)
    this.runContainer = this.runContainer.bind(this)
    this.state = {
      err: null,
      ws: new WebSocket('ws://localhost:8000'),
      containers: [],
      networkRequest: null,
      runStatus: false
    }
  }

  componentDidMount () {
    const { ws } = this.state
    ws.addEventListener('open', () => {
      console.info('Websocket connected')
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

  handleMessage (message) {
    // console.log('ws message - ', message)
    const parsedMessage = JSON.parse(message)
    switch (parsedMessage.type) {
      case 'ps':
        this.setState({runStatus: false, containers: parsedMessage.data})
        break
      case 'networkRequest':
        this.setState({networkRequest: parsedMessage.data}, () => {
          setTimeout(() => this.setState({networkRequest: null}), 500)
        })
        break
      default:
        break
    }
  }

  sendMessage (type, data) {
    console.log('ws send - ', type, data)
    this.state.ws.send(JSON.stringify({type, data}))
  }

  renderError () {
    return (
      <div className='App'>
        <div className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h2>Docker GUI</h2>
        </div>
        <h2 style={{color: 'red'}}>{this.state.err}</h2>
      </div>
    )
  }

  render () {
    if (this.state.err) {
      return this.renderError()
    }

    return (
      <div>
        <div className='App'>
          <div className='App-header'>
            <img src={logo} className='App-logo' alt='logo' />
            <h2>Docker Hive</h2>
          </div>
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
        <HexGrid containers={this.state.containers} networkRequest={this.state.networkRequest} />
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
