import React, { Component } from 'react'
import { TransactionCard } from '../components/transaction-card'

const Transactions = props => {
  return (
    <div>
      <div className="row mt-4 mb-3">
        <div className="col-sm-12">
          <h1>Transaction Information for "{/* title */}"</h1>
        </div>
      </div>
      <div className="row">
        <TransactionCard color="purple"/>
        <TransactionCard color="green"/>
        <TransactionCard color="orange"/>
      </div>
    </div>
  )
}