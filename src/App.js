import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import ContainerList from './ContainerList'
import { connect } from 'react-refetch'

class App extends Component {
  render () {
    const { psFetch } = this.props

    let containers
    if (psFetch.pending) {
      containers = <img alt='loading...' src='http://i.imgur.com/J0Sb8yR.gif' />
    } else if (psFetch.rejected) {
      containers = <p>Error: {psFetch.reason}</p>
    } else if (psFetch.fulfilled) {
      containers = <ContainerList containers={psFetch.value} />
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Docker GUI</h2>
        </div>
        {containers}
      </div>
    )
  }
}

App.propTypes = {
  psFetch: React.PropTypes.object
}

export default connect(props => ({
  psFetch: 'http://localhost:8000/ps'
}))(App)
