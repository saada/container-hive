import React, { Component } from 'react'
import './ContainerGroup.css'
import Container from './Container.js'

class ContainerGroup extends Component {
  render () {
    return (
      <div>
        <div className="ContainerGroup">
          {this.props.containers.map(container => <Container key={Math.random()} cid={container.Id.slice(0, 5)} />)}
        </div>
        {this.props.name} - {this.props.count}
      </div>
    )
  }
}

ContainerGroup.propTypes = {
  name: React.PropTypes.string,
  count: React.PropTypes.number,
  containers: React.PropTypes.array
}

export default ContainerGroup
