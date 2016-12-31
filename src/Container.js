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
    let highlightClass = ''
    if (!this.props.networkRequests) return ''
    this.props.networkRequests.forEach(networkRequest => {
      if (this.props.container.Id === networkRequest.request.from) {
        setTimeout(() => this.props.removeNetworkRequest(networkRequest.id), 400)
        highlightClass = 'sender'
      }
      if (this.props.container.Id === networkRequest.request.to) {
        setTimeout(() => this.props.removeNetworkRequest(networkRequest.id), 400)        
        highlightClass = 'receiver'
      }
    })

    return highlightClass
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
