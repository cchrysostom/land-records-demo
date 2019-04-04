import React, { Component } from 'react'
import { TransactionCard } from '../../components/transaction-card'

const TransactionDetails = props => {
  return (
    <div className='container'>
      <div className="row mt-4 mb-3">
        <div className="col-12">
          <h1>Transaction Information</h1>
        </div>
      </div>
      <div className="row">
        <TransactionCard color="green" type="Grantor" transaction={props.transactions.grantor} location={props.results.grantor.record.getLocation()} />
        <TransactionCard color="green" type="Grantee" transaction={props.transactions.grantee} location={props.results.grantee.record.getLocation()} />
        <TransactionCard color="orange" type="Location" transaction={props.transactions.spatial} location={props.results.spatial.record.getLocation()} />
        <TransactionCard color="purple" type="Tenure" transaction={props.transactions.tenure} location={props.results.tenure.record.getLocation()} />
      </div>
    </div>
  )
}

export default TransactionDetails