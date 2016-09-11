import React, { Component, PropTypes } from 'react'

import cytoscape from 'cytoscape'
import jquery from 'jquery'
import contextMenus from 'cytoscape-context-menus'
contextMenus(cytoscape, jquery)

import cycola from 'cytoscape-cola'
import cola from 'cola'
cycola(cytoscape, cola)
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
              shape: 'hexagon',
              'background-color': 'blue',
              label: 'data(id)'
            }
          }
        ],
        layout: {
          name: 'grid',
          fit: true,
          padding: 30,
        }
      })
    })
  }

  removeOldContainers () {
    this.state.cy.nodes().forEach(node => {
      const containers = this.props.elements.filter(el => el.data.id === node.id())
      const containerRunning = containers.length
      if (!containerRunning) {
        const nodeToRemove = `#${node.id()}`
        this.state.cy.remove(nodeToRemove)
      }
    })
  }

  render () {
    if (this.props.elements) {
      this.removeOldContainers()
      this.state.cy.add(this.props.elements)
    }
    return <div ref="graph" className="Graph" />
  }
}

Graph.propTypes = {
  elements: PropTypes.array
}

export default Graph
