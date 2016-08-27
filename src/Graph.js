import React, { Component } from 'react'
import cytoscape from 'cytoscape'
import './Graph.css'

class Graph extends Component {
  componentDidMount () {
    console.log('setting up cytoscape...', this.refs.graph)
    cytoscape({
      container: this.refs.graph,
      elements: [
        // nodes
        { data: { id: 'a' } },
        { data: { id: 'b' } },
        { data: { id: 'c' } },
        { data: { id: 'd' } },
        { data: { id: 'e' } },
        { data: { id: 'f' } },
        // edges
        {
          data: {
            id: 'ab',
            source: 'a',
            target: 'b'
          }
        },
        {
          data: {
            id: 'cd',
            source: 'c',
            target: 'd'
          }
        },
        {
          data: {
            id: 'ef',
            source: 'e',
            target: 'f'
          }
        },
        {
          data: {
            id: 'ac',
            source: 'a',
            target: 'd'
          }
        },
        {
          data: {
            id: 'be',
            source: 'b',
            target: 'e'
          }
        }
      ],
      style: [
        {
          selector: 'node',
          style: {
            shape: 'hexagon',
            'background-color': 'red',
            label: 'data(id)'
          }
        }
      ],
      layout: {
        name: 'grid'
      }
    })
  }

  componentWillMount () {
    console.log('will mount')
  }

  componentWillUnmount () {
    console.log('will unmount')
  }

  render () {
    return <div ref="graph" className="Graph" />
  }
}

Graph.propTypes = {
}

export default Graph
