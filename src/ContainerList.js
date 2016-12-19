import React, { Component } from 'react'
import ContainerGroup from './ContainerGroup.js'
import './ContainerList.css'

class ContainerList extends Component {
  render () {
    let containerGroups = []
    this.props.containers.forEach(container => {
      if (typeof containerGroups[container.Image] === 'undefined') {
        containerGroups[container.Image] = []
      }
      containerGroups[container.Image].push(container)
    })

    let output
    if (Object.keys(containerGroups).length) {
      output = Object.keys(containerGroups).map(name => {
        return <ContainerGroup key={Math.random()} name={name} count={containerGroups[name].length} containers={containerGroups[name]} kill={this.props.kill} networkRequest={this.props.networkRequest} />
      })
    } else {
      output = <h1>There are no running containers...</h1>
    }

    return (
      <div className="ContainerList">
        {output}
      </div>
    )
  }
}

ContainerList.propTypes = {
  containers: React.PropTypes.array
}

export default ContainerList
