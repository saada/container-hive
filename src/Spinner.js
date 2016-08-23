import React, { Component } from 'react'

class Spinner extends Component {
  render () {
    return (
      <img width={this.props.width || 50} alt="loading..." src="http://localhost:8000/images/squares.gif" />
    )
  }
}

Spinner.propTypes = {
  width: React.PropTypes.number
}

export default Spinner
