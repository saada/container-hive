import React, {Component} from 'react'
import { TransitionMotion, Motion, spring } from 'react-motion'
import { range } from 'lodash'
import './HexGrid.css'

// number of cols
const C = 4
/**
 * hexagon height constant
 *    /|\
 *   / | \
 *  /  |  \
 * |   |   |
 * |   H   |
 * |   |   |
 *  \  |  /
 *   \ | /
 *    \|/
 */
const H = 100

const hexCoordinates = {
  TOP: `${H / 2},0`,
  TOP_RIGHT: `${H * 0.932},${H / 4}`,
  BOTTOM_RIGHT: `${H * 0.932},${H / 1.33}`,
  BOTTOM: `${H / 2},${H}`,
  BOTTOM_LEFT: `${H * 0.068},${H / 1.33}`,
  TOP_LEFT: `${H * 0.068},${H / 4}`
}
// const flatTopHexagon = '50,25 37.5,46.66 12.5,46.66 0,25 12.5,3.33 37.5,3.33'
const pointyTopHexagon = `${hexCoordinates.TOP} ${hexCoordinates.TOP_RIGHT} ${hexCoordinates.BOTTOM_RIGHT} ${hexCoordinates.BOTTOM} ${hexCoordinates.BOTTOM_LEFT} ${hexCoordinates.TOP_LEFT}`

const springSetting1 = {stiffness: 180, damping: 10}
const springSetting2 = {stiffness: 120, damping: 17}
function reinsert (arr, from, to) {
  const _arr = arr.slice(0)
  const val = _arr[from]
  _arr.splice(from, 1)
  _arr.splice(to, 0, val)
  return _arr
}

function clamp (n, min, max) {
  return Math.max(Math.min(n, max), min)
}

const allColors = [
  '#EF767A', '#456990', '#49BEAA', '#49DCB1', '#EEB868', '#EF767A', '#456990',
  '#49BEAA', '#49DCB1', '#EEB868', '#EF767A'
]

export default class HexGrid extends Component {
  constructor (props) {
    super(props)
    this.state = {
      count: 0,
      width: H - (H * 0.136), // horizontal space between hexagons
      height: H - (H * 0.136 * 1.80), // vertical space between hexagons
      layout: [],
      mouse: [0, 0],
      delta: [0, 0], // difference between mouse and circle pos, for dragging
      lastPress: null, // key of the last pressed component
      isPressed: false,
      order: [] // index: visual position. value: component key/id
    }
  }

  componentWillReceiveProps (props) {
    const count = props.containers.length
    const updatedState = {
      count,
      // indexed by visual position
      layout: range(count).map(n => {
        const row = Math.floor(n / C)
        const col = n % C
        return row % 2 === 0 ? [this.state.width * col, this.state.height * row] : [(this.state.width * col) + (this.state.width / 2), this.state.height * row]
        // return [this.state.width * col, this.state.height * row]
      })
    }
    // maintain order as much as possible
    let currentOrder = Object.assign([], this.state.order)
    if (count !== currentOrder.length) {
      if (count > currentOrder.length) {
        // add new containers
        currentOrder = currentOrder.concat(range(currentOrder.length, count))
      } else {
        // remove old containers
        currentOrder = currentOrder.filter(n => n < count)
      }
      updatedState.order = currentOrder // index: visual position. value: component key/id
      console.log(this.state.order, currentOrder)
    }
    this.setState(updatedState)
  }

  componentDidMount () {
    window.addEventListener('touchmove', e => this.handleTouchMove(e))
    window.addEventListener('touchend', e => this.handleMouseUp(e))
    window.addEventListener('mousemove', e => this.handleMouseMove(e))
    window.addEventListener('mouseup', e => this.handleMouseUp(e))
  }

  handleTouchStart (key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0])
  }

  handleTouchMove (e) {
    e.preventDefault()
    this.handleMouseMove(e.touches[0])
  }

  handleMouseMove ({pageX, pageY}) {
    const { order, lastPress, isPressed, delta: [dx, dy] } = this.state
    if (isPressed) {
      const mouse = [pageX - dx, pageY - dy]
      const col = clamp(Math.floor(mouse[0] / this.state.width), 0, 2)
      const row = clamp(Math.floor(mouse[1] / this.state.height), 0, Math.floor(this.state.count / C))
      const index = row * C + col
      const newOrder = reinsert(order, order.indexOf(lastPress), index)
      this.setState({mouse: mouse, order: newOrder})
    }
  }

  handleMouseDown (key, [pressX, pressY] , {pageX, pageY}) {
    this.setState({
      lastPress: key,
      isPressed: true,
      delta: [pageX - pressX, pageY - pressY],
      mouse: [pressX, pressY]
    })
  }

  handleMouseUp () {
    this.setState({isPressed: false, delta: [0, 0]})
  }

  getHighlightClass (container) {
    const { networkRequests } = this.props
    if (!networkRequests.length) return ''
    for (let j = 0; j < networkRequests.length; j++) {
      if (container.Id === networkRequests[j].request.from) {
        return 'sender'
      }
      if (container.Id === networkRequests[j].request.to) {
        return 'receiver'
      }
    }
    return ''
  }

  getSenderAndReceiverCoordinates (networkRequest) {
    return this.state.order.reduce((acc, order, index) => {
      const container = this.props.containers[order]
      if (container.Id === networkRequest.from) {
        acc.sender = this.state.layout[index]
      } else if (container.Id === networkRequest.to) {
        acc.receiver = this.state.layout[index]
      }
      return acc
    }, {sender: null, receiver: null})
  }

  getParticles () {
    const particles = this.props.networkRequests.map(networkRequest => {
      const {sender, receiver} = this.getSenderAndReceiverCoordinates(networkRequest.request)
      if (!sender || !receiver || this.state.isPressed) {
        this.props.removeNetworkRequest(networkRequest.id)
        return null
      }
      return {key: networkRequest.id, x1: sender[0], y1: sender[1], x2: receiver[0], y2: receiver[1]}
    })
    const borderWidth = 3
    const particleSpring = {stiffness: this.props.stiffness, damping: this.props.damping}
    return (
      <TransitionMotion
        willLeave={particle => {
          return {
            translateX: spring(particle.data.x2, particleSpring),
            translateY: spring(particle.data.y2, particleSpring),
            opacity: spring(1, particleSpring)
          }
        }}

        styles={particles.map(particle => ({
          key: particle.key,
          data: particle,
          style: {
            translateX: particle.x1,
            translateY: particle.y1,
            opacity: 0.5
          }
        }))}>
        {interpolatedStyles =>
          <div>
            {interpolatedStyles.map(({key, style: {translateX, translateY, opacity}}, index) => {
              // console.log(translateX, translateY, opacity)
              return <svg key={key} width='8' height='8' style={{
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(1)`,
                marginTop: `${(H / 2) - borderWidth / 2}px`,
                marginLeft: `${(H / 2) - borderWidth / 2}px`,
                opacity: opacity,
                position: 'absolute',
                zIndex: 1000
              }}>
                <circle cx='4' cy='4' r='4' fill={allColors[index % allColors.length]} style={{
                  stroke: 'black',
                  strokeWidth: 0.5
                }} />
              </svg>
            })}
          </div>
        }
      </TransitionMotion>
    )
  }

  render () {
    const {order, lastPress, isPressed, mouse} = this.state
    return (
      <div className='HexGridContainer'>
        <div className='HexGrid' style={{
          width: `${C * H}px`,
          height: '320px'
        }}>
          {order.map((_, key) => {
            let style
            let x
            let y
            const visualPosition = order.indexOf(key)
            if (key === lastPress && isPressed) {
              [x, y] = mouse
              style = {
                translateX: x,
                translateY: y,
                scale: spring(1.2, springSetting1),
                boxShadow: spring((x - (C * this.state.width - H) / 2) / 15, springSetting1)
              }
            } else {
              [x, y] = this.state.layout[visualPosition]
              style = {
                translateX: spring(x, springSetting2),
                translateY: spring(y, springSetting2),
                scale: spring(1, springSetting1),
                boxShadow: spring((x - (C * this.state.width - H) / 2) / 15, springSetting1)
              }
            }
            const container = this.props.containers[key]
            const networkSide = this.getHighlightClass(container)
            const splitColon = container.Image.split(':')[0]
            const splitSlash = splitColon.split('/')
            const name = splitSlash[splitSlash.length - 1]
            return (
              <Motion key={key} style={style}>
                {({translateX, translateY, scale, boxShadow}) =>
                  <svg width={H} height={H}
                    title={JSON.stringify(container, null, 2)}
                    onMouseDown={this.handleMouseDown.bind(this, key, [x, y])}
                    onTouchStart={this.handleTouchStart.bind(this, key, [x, y])}
                    style={{
                      padding: '1px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      color: 'white',
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                      zIndex: key === lastPress ? 99 : visualPosition,
                      // boxShadow: `${boxShadow}px 5px 5px rgba(0,0,0,0.5)`
                    }}
                    className={'HexCell ' + networkSide}
                  >
                    <polygon
                      fill={allColors[key % allColors.length]}
                      points={pointyTopHexagon}
                    >
                    </polygon>
                    <text x={H / 2} y={H / 2} textAnchor='middle' alignmentBaseline='middle' stroke='none' fill='white'>{name}</text>
                  </svg>
                }
              </Motion>
            )
          })}
          {this.getParticles()}
        </div>
      </div>
    )
  }
}
