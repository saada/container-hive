import React, { Component } from 'react'
import './ContainerGroup.css'
import Container from './Container'

class ContainerGroup extends Component {
  getContainers () {
    return this.props.containers.map(container => <Container key={Math.random()} container={container} />)
  }

  render () {
    return (
      <div>
        <div className="ContainerGroup">
          {this.getContainers()}
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
