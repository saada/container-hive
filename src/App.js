import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import ContainerList from './ContainerList'
import { connect } from 'react-refetch'

class App extends Component {
  constructor () {
    super()
    this.getContainers = this.getContainers.bind(this)
    this.getDemo = this.getDemo.bind(this)
  }
  groupByNetworks (containers) {
  }

  runContainer (image) {
  }

  getContainers () {
    const fetch = this.props.psFetch
    if (fetch.pending) {
      return <img alt="loading..." src="http://localhost:8000/images/squares.gif" />
    } else if (fetch.rejected) {
      return <p>Error: {fetch.reason}</p>
    } else if (fetch.fulfilled) {
      return <ContainerList containers={fetch.value} />
    }
  }

  getDemo () {
    const image = this.refs.selectedImage.value
    this.props.demoFetch(image)
    console.log(this.props)
    const fetch = this.props.demoFetch
    if (fetch.pending) {
      return <p>Creating new redis container...</p>
    } else if (fetch.rejected) {
      return <p>Error: {fetch.reason}</p>
    } else if (fetch.fulfilled) {
      return <p>{fetch.value.message} - redis container created!</p>
    }
  }

  render () {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Docker GUI</h2>
        </div>
        {this.getContainers()}
        <select ref="selectedImage">
          <option>library/redis</option>
          <option>library/nginx</option>
        </select>
        <button onClick={this.getDemo}>Add Container</button>
      </div>
    )
  }
}

App.propTypes = {
  psFetch: React.PropTypes.object,
  demoFetch: React.PropTypes.func
}

const URL_PS = 'http://localhost:8000/ps'
const URL_DEMO = 'http://localhost:8000/demo'

export default connect(props => ({
  psFetch: {url: URL_PS, refreshInterval: 5000},
  demoFetch: (image) => ({
    startDemo: {
      url: URL_DEMO,
      method: 'POST',
      body: JSON.stringify({ image }),
      force: true,
      andThen: () => ({
        psFetch: {url: URL_PS, refreshing: true, force: true, refreshInterval: 5000}
      })
    }
  })
}))(App)
