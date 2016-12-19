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

  render () {
    if (this.state.killing) {
      return <Spinner />
    }

    return (
      <div className="Container">
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
