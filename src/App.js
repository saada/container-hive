import React, { Component, PropTypes } from 'react'
import { connect, PromiseState } from 'react-refetch'
import logo from './logo.svg'
import './App.css'
import ContainerList from './ContainerList'
import Hive from './Hive'
import Spinner from './Spinner'

class App extends Component {
  constructor () {
    super()
    this.getContainers = this.getContainers.bind(this)
    this.getSelectedImage = this.getSelectedImage.bind(this)
    this.runContainer = this.runContainer.bind(this)
    this.state = {
      err: null
    }
  }

  componentWillReceiveProps (nextProps) {
    nextProps.psFetch.catch(err => {
      console.log(err)
      this.setState({err: 'Server is down! Make sure Docker is running and try starting the server with `npm run start-server`.'})
    })
  }

  runContainer (image) {
    this.props.runFetch(this.getSelectedImage())
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
    if (this.props.runFetchResponse) {
      const fetch = this.props.runFetchResponse
      if (fetch.pending) {
        return <p>Pulling and creating new {this.getSelectedImage()} container...</p>
      } else if (fetch.rejected) {
        return <p>Error: {fetch.reason}</p>
      } else if (fetch.fulfilled) {
        return <p>{fetch.value.message} - redis container created!</p>
      }
    }
  }

  getElements () {
    if (!this.props.psFetch.value) {
      return null
    }

    return this.props.psFetch.value.map(container => {
      return {
        data: {
          id: container.Id.slice(0, 5)
        }
      }
    })
  }

  renderError () {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Docker GUI</h2>
        </div>
        <h2 style={{color: 'red'}}>{this.state.err}</h2>
      </div>
    )
  }

  render () {
    if (this.state.err) {
      return this.renderError()
    }

    return (
      <div>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Docker Hive</h2>
          </div>
          {this.getContainers()}
          <select ref="selectedImage">
            <option>library/redis</option>
            <option>library/nginx</option>
          </select>
          <button onClick={this.runContainer}>Add Container</button>
          {this.getStatus()}
        </div>
        <Hive containers={
          [
            {Id: 1, Image: 'apple'},
            {Id: 2, Image: 'orange'},
            {Id: 3, Image: 'carrot'},
            {Id: 4, Image: 'bee'},
            {Id: 5, Image: 'bee'},
            {Id: 6, Image: 'honey'},
            {Id: 7, Image: 'honey'},
            {Id: 8, Image: 'honey'},
            {Id: 9, Image: 'queen'}
          ]
        } />
      </div>
    )
  }
}

App.propTypes = {
  psFetch: PropTypes.object,
  runFetch: PropTypes.func,
  runFetchResponse: PropTypes.instanceOf(PromiseState)
}

const URL_PS = 'http://localhost:8000/ps'
const URL_RUN = 'http://localhost:8000/run'

export default connect(props => ({
  psFetch: {url: URL_PS, refreshInterval: 5000},
  runFetch: (image) => ({
    runFetchResponse: {
      url: URL_RUN,
      method: 'POST',
      body: JSON.stringify({ image }),
      force: true,
      andThen: () => ({
        psFetch: {url: URL_PS, refreshing: true, force: true, refreshInterval: 5000}
      })
    }
  })
}))(App)
