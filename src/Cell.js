import React, { Component, PropTypes } from 'react'
import './Cell.css'

class Cell extends Component {

  render () {
    return <div className="Cell">
      <div className={`hex ${this.props.isPlaceholder ? 'placeholder' : ''}`}>&#x2B22;</div>
      <div>{this.props.name}</div>
      <div>{this.props.count}</div>
    </div>
  }
}

Cell.propTypes = {
  name: PropTypes.string,
  count: PropTypes.number,
  isPlaceholder: PropTypes.string
}

export default Cell
