import React, {Component} from 'react'
import { Motion, spring } from 'react-motion'
import { range } from 'lodash'
import './HexGrid.css'

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
      width: 70,
      height: 90,
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
        const row = Math.floor(n / 3)
        const col = n % 3
        return [this.state.width * col, this.state.height * row]
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
    window.addEventListener('touchmove', this.handleTouchMove.bind(this))
    window.addEventListener('touchend', this.handleMouseUp.bind(this))
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('mouseup', this.handleMouseUp.bind(this))
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
      const row = clamp(Math.floor(mouse[1] / this.state.height), 0, Math.floor(this.state.count / 3))
      const index = row * 3 + col
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
    if (!this.props.networkRequest) return ''
    const networks = container.NetworkSettings.Networks
    const networkKeys = Object.keys(networks)
    for (let i = 0; i < networkKeys.length; i++) {
      const network = networks[networkKeys[i]]
      if (network.IPAddress === this.props.networkRequest.from) {
        return 'sender'
      }
      if (network.IPAddress === this.props.networkRequest.to) {
        return 'receiver'
      }
    }
    return ''
  }

  render () {
    const {order, lastPress, isPressed, mouse} = this.state
    return (
      <div className='HexGridContainer'>
        <div className='HexGrid'>
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
                boxShadow: spring((x - (3 * this.state.width - 50) / 2) / 15, springSetting1)
              }
            } else {
              [x, y] = this.state.layout[visualPosition]
              style = {
                translateX: spring(x, springSetting2),
                translateY: spring(y, springSetting2),
                scale: spring(1, springSetting1),
                boxShadow: spring((x - (3 * this.state.width - 50) / 2) / 15, springSetting1)
              }
            }
            const container = this.props.containers[key]
            return (
              <Motion key={key} style={style}>
                {({translateX, translateY, scale, boxShadow}) =>
                  <div
                    title={JSON.stringify(container, null, 2)}
                    onMouseDown={this.handleMouseDown.bind(this, key, [x, y])}
                    onTouchStart={this.handleTouchStart.bind(this, key, [x, y])}
                    className={'HexCell ' + this.getHighlightClass(container)}
                    style={{
                      backgroundColor: allColors[key % allColors.length],
                      WebkitTransform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                      zIndex: key === lastPress ? 99 : visualPosition,
                      boxShadow: `${boxShadow}px 5px 5px rgba(0,0,0,0.5)`
                    }}
                  >
                    {container.Image}
                  </div>}
              </Motion>
          )
        })}
        </div>
      </div>
    )
  }
}
