import React, { Component } from 'react'
import { Motion, spring } from 'react-motion'

const particleSpring = {stiffness: 300, damping: 30}

class Particle extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  componentDidMount () {
    setTimeout(() => this.props.removeNetworkRequest(), 400)
  }
  render () {
    const {x1, y1, x2, y2} = this.props
    const borderWidth = 3
    // console.log(x1, y1, x2, y2, this.props.width / 2, this.props.height / 2)
    return <Motion
      onRest={() => this.props.removeNetworkRequest()}
      defaultStyle={{
        translateX: x1,
        translateY: y1,
        opacity: 1
      }}
      style={{
        translateX: spring(x2, particleSpring),
        translateY: spring(y2, particleSpring),
        opacity: spring(1, particleSpring)
      }}>
      {({opacity, translateX, translateY}) => {
        return <div style={{
          WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(1)`,
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(1)`,
          zIndex: 1000,
          border: `${borderWidth}px solid gold`,
          borderRadius: '99px',
          position: 'absolute',
          marginTop: `${(50 / 2) - borderWidth / 2}px`,
          marginLeft: `${(50 / 2) - borderWidth / 2}px`
        }} />
      }}
    </Motion>
  }
}

export default Particle
