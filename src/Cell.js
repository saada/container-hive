import React, { Component, PropTypes } from 'react'
import './Cell.css'

class Cell extends Component {
  render () {
    return <div className="Cell">
      <div className={`hex ${this.props.isPlaceholder ? 'placeholder' : ''}`}>&#x2B22;</div>
      <div className="cell-content">
        <div className="cell-name">{this.props.name}</div>
        <div className="cell-count">{this.props.count}</div>
      </div>
    </div>
  }
}

Cell.propTypes = {
  name: PropTypes.string,
  count: PropTypes.number,
  isPlaceholder: PropTypes.string
}

export default Cell
