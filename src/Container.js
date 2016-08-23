import React, { Component, PropTypes } from 'react'
import './Container.css'
import Spinner from './Spinner'
import { connect, PromiseState } from 'react-refetch'

class Container extends Component {
  constructor () {
    super()
    this.kill = this.kill.bind(this)
  }
  kill (id) {
    this.props.killContainer(this.props.container.Id)
  }
  render () {
    if (this.props.killResponse) {
      if (this.props.killResponse.pending) {
        return <Spinner />
      } else if (this.props.killResponse.fulfilled) {
        return null
      }
    }

    return (
      <div className="Container">
        {this.props.container.Id.slice(0, 5)}
        <button style={{marginLeft: '5px'}} onClick={this.kill}>X</button>
      </div>
    )
  }
}

Container.propTypes = {
  container: PropTypes.object,
  killContainer: PropTypes.func,
  killResponse: PropTypes.instanceOf(PromiseState)
}

export default connect(props => ({
  killContainer: (id) => ({
    killResponse: {
      url: 'http://localhost:8000/kill',
      method: 'POST',
      body: JSON.stringify({ id }),
      force: true,
      andThen: () => ({
        psFetch: {url: 'http://localhost:8000/ps', refreshing: true, force: true}
      }),
      andCatch: (err) => {
        console.log(err)
      }
    }
  })
}))(Container)
