import React, { Component } from 'react'
import './Container.css'
import { connect } from 'react-refetch'

class Container extends Component {
  constructor () {
    super()
    this.kill = this.kill.bind(this)
  }
  kill (id) {
    this.props.killContainer(this.props.container.Id)
  }
  render () {
    return (
      <div className="Container">
        {this.props.container.Id.slice(0, 5)}
        <button style={{marginLeft: '5px'}} onClick={this.kill}>X</button>
      </div>
    )
  }
}

Container.propTypes = {
  container: React.PropTypes.object,
  killContainer: React.PropTypes.func
}

export default connect(props => ({
  killContainer: (id) => ({
    startDemo: {
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
