import React, { Component, PropTypes } from 'react'
import cytoscape from 'cytoscape'
import cycola from 'cytoscape-cola'
import cola from 'cola'
cycola(cytoscape, cola) // register extension
import './Graph.css'

class Graph extends Component {
  constructor () {
    super()
    this.state = {
      cy: null
    }
  }

  componentDidMount () {
    console.log('setting up cytoscape...', this.refs.graph)
    this.setState({
      cy: cytoscape({
        container: this.refs.graph,
        elements: [],
        style: [
          {
            selector: 'node',
            style: {
              shape: 'rectangle',
              'background-color': 'black',
              label: 'data(id)'
            }
          }
        ],
        layout: {
          name: 'grid'
        }
      })
    })
  }

  render () {
    console.log('rerender graph...')
    if (this.props.elements) {
      this.state.cy.nodes().forEach(node => {
        if (!this.props.elements.includes({data: {id: node.id()}})) {
          console.log(node.id())
          this.state.cy.remove(`#${node.id()}`)
        }
      })
      console.log(this.state.cy.nodes(), this.props.elements)
      this.state.cy.add(this.props.elements)
    }
    return <div ref="graph" className="Graph" />
  }
}

Graph.propTypes = {
  elements: PropTypes.array
}

export default Graph
