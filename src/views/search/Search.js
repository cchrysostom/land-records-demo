import React, { Component } from 'react'

export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      results: []
    }
  }

  componentDidMount() {

  }

  render() {
    let results = this.state.results.map(result => {
      console.log(result)
      // return <PropertyResult {...result}/>
    })

    return (
      <div className="row mt-5">
        <div className="col-sm-12 col-md-8 offset-md-2">
          <h2>Search Result for "House"</h2>
          {results}
        </div>
      </div>
    )
  }
}

const PropertyResult = props => {
  return (
    <li className="list-group-item d-flex">
      {/*props.transaction.thumbnail ? <img src={props.transaction.thumbnail} alt=""/> : null*/}
      <div className="list-meta">
        <div className="title">{props.transaction.name}</div>
        <div className="transaction">Transaction ID: <span className="transactionId">{props.transaction.name}</span></div>
        <div className="author">Created by <span className="name">{props.transaction.name}</span></div>
      </div>
      <span className="action">
        <a onClick={() => { }}>
          <i className="fa fa-right"></i>
        </a>
      </span>
    </li>
  )
}

