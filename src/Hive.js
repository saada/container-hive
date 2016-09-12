import React, { Component, PropTypes } from 'react'
import './Hive.css'
import Cell from './Cell'

class Hive extends Component {
  getCells () {
    if (!this.props.containers) {
      return null
    }
    const groups = this.getContainerGroups()
    const groupNames = Object.keys(groups)
    if (groupNames.length) {
      return groupNames.map(groupName => {
        return <Cell 
          key={groupName}
          name={groupName}
          count={groups[groupName].length}
        />
      })
    }

    return null
  }

  getContainerGroups () {
    let containerGroups = []
    this.props.containers.forEach(container => {
      if (typeof containerGroups[container.Image] === 'undefined') {
        containerGroups[container.Image] = []
      }
      containerGroups[container.Image].push(container)
    })
    return containerGroups
  }

  render () {
    return (
      <div>
        <div className="Hive">
          {this.getCells()}
        </div>
      </div>
    )
  }
}

Hive.propTypes = {
  containers: PropTypes.array
}

export default Hive
