import React, { Component, PropTypes } from 'react'
import './Cell.css'
class Cell extends Component {

  render () {
    return <div className="Cell">
      <div className="hex">&#x2B22;</div>
      <label>{this.props.name}</label>
      <div>total: {this.props.count}</div>
    </div>
  }
}

Cell.propTypes = {
  name: PropTypes.string,
  count: PropTypes.number
}

export default Cell
