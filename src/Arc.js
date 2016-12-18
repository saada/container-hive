import React, { Component, PropTypes } from 'react'

class Arc extends Component {
  render () {
    const styles = {
      width: '1px'
    }
    return <div style={styles} />
  }
}

Arc.propTypes = {
  x1: PropTypes.number,
  y1: PropTypes.number,
  x2: PropTypes.number,
  y2: PropTypes.number
}

export default Arc
