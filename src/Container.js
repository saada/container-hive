import React, { Component, PropTypes } from 'react'
import './Container.css'
import Spinner from './Spinner'

class Container extends Component {
  constructor () {
    super()
    this.kill = this.kill.bind(this)
  }
  kill (id) {
    const ws = new WebSocket('ws://localhost:8000')
    ws.onopen = () => {
      ws.send(JSON.stringify({type: 'kill', data: {id: this.props.container.Id}}))
    }
  }
  render () {
    if (this.props.killResponse) {
      if (this.props.killResponse.pending) {
        return <Spinner />
      } else if (this.props.killResponse.fulfilled) {
        return null
      }
    }

    return (
      <div className="Container">
        {this.props.container.Id.slice(0, 5)}
        <button style={{marginLeft: '5px'}} onClick={this.kill}>X</button>
      </div>
    )
  }
}

Container.propTypes = {
  container: PropTypes.object
}

export default Container
