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
    console.log('perf')
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
        return <svg width='8' height='8' style={{
          transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(1)`,
          marginTop: `${(50 / 2) - borderWidth / 2}px`,
          marginLeft: `${(50 / 2) - borderWidth / 2}px`,
          position: 'absolute',
          zIndex: 1000
        }}>
          <circle cx='4' cy='4' r='4' fill='yellow' />
        </svg>
      }}
    </Motion>
  }
}

export default Particle
