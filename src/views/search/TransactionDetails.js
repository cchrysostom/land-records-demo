import React, { Component } from 'react'
import { TransactionCard } from '../../components/transaction-card'

const TransactionDetails = props => {
  return (
    <div>
      <div className="row mt-4 mb-3">
        <div className="col-sm-12">
          <h1>Transaction Information</h1>
        </div>
      </div>
      <div className="row">
        <TransactionCard color="purple" type="Tenure" transaction={props.transactions.tenure}/>
        <TransactionCard color="green" type="Party" transaction={props.transactions.party}/>
        <TransactionCard color="orange" type="Location" transaction={props.transactions.spatial}/>
      </div>
    </div>
  )
}

export default TransactionDetails