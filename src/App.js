import React, { Component, PropTypes } from 'react'
import { connect, PromiseState } from 'react-refetch'
import logo from './logo.svg'
import './App.css'
import ContainerList from './ContainerList'
import Graph from './Graph'
import Spinner from './Spinner'

class App extends Component {
  constructor () {
    super()
    this.getContainers = this.getContainers.bind(this)
    this.getSelectedImage = this.getSelectedImage.bind(this)
    this.runContainer = this.runContainer.bind(this)
  }
  groupByNetworks (containers) {
  }

  runContainer (image) {
    this.props.demoFetch(this.getSelectedImage())
  }

  getContainers () {
    const fetch = this.props.psFetch
    if (fetch.pending) {
      return <Spinner width={100} />
    } else if (fetch.rejected) {
      return <p>Error: {fetch.reason}</p>
    } else if (fetch.fulfilled) {
      return <ContainerList containers={fetch.value} />
    }
  }

  getSelectedImage () {
    return this.refs.selectedImage.value
  }

  getStatus () {
    if (this.props.demoFetchResponse) {
      const fetch = this.props.demoFetchResponse
      if (fetch.pending) {
        return <p>Pulling and creating new {this.getSelectedImage()} container...</p>
      } else if (fetch.rejected) {
        return <p>Error: {fetch.reason}</p>
      } else if (fetch.fulfilled) {
        return <p>{fetch.value.message} - redis container created!</p>
      }
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
        <button onClick={this.runContainer}>Add Container</button>
        {this.getStatus()}
        <Graph />
      </div>
    )
  }
}

App.propTypes = {
  psFetch: PropTypes.object,
  demoFetch: PropTypes.func,
  demoFetchResponse: PropTypes.instanceOf(PromiseState)
}

const URL_PS = 'http://localhost:8000/ps'
const URL_DEMO = 'http://localhost:8000/demo'

export default connect(props => ({
  psFetch: {url: URL_PS, refreshInterval: 5000},
  demoFetch: (image) => ({
    demoFetchResponse: {
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
