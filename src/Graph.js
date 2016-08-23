import React, { Component } from 'react'
import cytoscape from 'cytoscape'

class Graph extends Component {
  componentDidMount () {
    console.log('did mount', this.refs.graph)
    cytoscape({
      container: this.refs.graph,
      elements: [ // list of graph elements to start with
        { // node a
          data: { id: 'a' }
        },
        { // node b
          data: { id: 'b' }
        },
        { // edge ab
          data: { id: 'ab', source: 'a', target: 'b' }
        }
      ],

      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],

      layout: {
        name: 'grid',
        rows: 1
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
    return (
      <div ref="graph" className="Graph">
        GRAPH
      </div>
    )
  }
}

Graph.propTypes = {
}

export default Graph
