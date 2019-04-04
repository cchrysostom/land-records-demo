import React, { Component } from 'react'
import { getTransaction, getAddress, getTransactionsByAddress } from './api';

export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      results: []
    }
  }

  componentDidMount() {

  }

  transaction () {
    getTransaction({
      transaction: '444e495277fd5c076a3919b461733a7a1afe2a2388fb7c0dd37755327a4bf6c4'
    }, success => {
      console.log(success)
    }, failure => {
      console.log(failure)
    })
  }

  address () {
    getAddress({
      address: 'oRnG68BqvRw2qiS8sRbsuEfpRHeFtPDPpr'
    }, success => {
      console.log(success)
    }, failure => {
      console.log(failure)
    })
  }

  addresstransactions () {
    getTransactionsByAddress({
      address: 'oRnG68BqvRw2qiS8sRbsuEfpRHeFtPDPpr'
    }, success => {
      console.log(success)
    }, failure => {
      console.log(failure)
    })
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
          <button onClick={this.transaction}>transaction</button>
          <button onClick={this.address}>address</button>
          <button onClick={this.addresstransactions}>addresstransactions</button>
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

