import React, { Component, PropTypes } from 'react'
import './Container.css'
import Spinner from './Spinner'

class Container extends Component {
  constructor () {
    super()
    this.state = {
      killing: false
    }
  }

  getHighlightClass () {
    if (!this.props.networkRequest) return ''
    const networks = this.props.container.NetworkSettings.Networks
    const networkKeys = Object.keys(networks)
    for (let i = 0; i < networkKeys.length; i++) {
      const network = networks[networkKeys[i]]
      if (network.IPAddress === this.props.networkRequest.from) {
        return 'sender'
      }
      if (network.IPAddress === this.props.networkRequest.to) {
        return 'receiver'
      }
    }
    return ''
  }

  render () {
    if (this.state.killing) {
      return <Spinner />
    }

    return (
      <div className={'Container ' + this.getHighlightClass()}>
        {this.props.container.Id.slice(0, 5)}
        <button style={{marginLeft: '5px'}} onClick={() => {
          this.setState({killing: true})
          this.props.kill(this.props.container.Id)
        }}>X</button>
      </div>
    )
  }
}

Container.propTypes = {
  container: PropTypes.object
}

export default Container
