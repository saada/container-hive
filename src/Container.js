import React, { Component } from 'react'
import './Container.css'

class Container extends Component {
  render () {
    return (
      <div className="Container">
        {this.props.cid}
      </div>
    )
  }
}

Container.propTypes = {
  cid: React.PropTypes.string
}

export default Container
