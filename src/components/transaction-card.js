import React from 'react';
import moment from 'moment';

const RECENT_FLO_PRICE_USD = 0.08

export const TransactionCard = props => {
  console.log(props)
  let tx = props.transaction;
  let icon = '';
  let location = props.location
  return (
    <div className="col-sm-12 col-md-6, col-lg-6">
      <div className={`transaction-card-title pl-3 mb-2 ${props.color}`}><i className="transaction-card-icon"></i> {props.type} Information</div>
      <div className={`card ${props.color}`}>
        <div className="card-body p-0">
          <h5 className="card-title p-2"><strong>Transaction Id:</strong><br /><span style={{fontSize: '12px !important'}}>{tx.txId}</span></h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <div className="d-flex">
                <span className="mr-auto"><strong>Size:</strong></span>
                <span className="ml-auto">{tx.size} (bytes)</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Fee:</strong></span>
                <span className="ml-auto">{tx.fees} FLO (${parseFloat((tx.fees * RECENT_FLO_PRICE_USD).toFixed(8))} USD)</span>
              </div>
            </li>
            <li className="list-group-item">
              <div><strong>Included in Block:</strong></div>
              {(tx.blockhash && tx.blockhash !== '') ? <span style={{fontSize: '12px !important'}}>{tx.blockhash}</span> : 'Pending...'}
            </li>
            <li className="list-group-item">
              <div className="d-flex">
                <span className="mr-auto"><strong>Mined Time:</strong></span>
                <span className="ml-auto">{(tx.blockhash && tx.blockhash !== '') ? moment(Date(tx.received)).format("MMM D, YYYY h:mm:ss A") : 'Pending...'}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <a href={`https://testnet.explorer.mediciland.com/tx/${tx.txId}`} target="_blank" className="d-block pl-3 mb-2 mt-2" style={{ fontSize: '14px', color: '#9CA0A1' }}>View Full Transaction Details <span>›</span></a>
      {location && location !== '' && !location.includes('dummy') ? (
        <a href={`http://35.237.201.254:8080/ipfs/${location}`} target="_blank" className="d-block pl-3 mb-3" style={{ fontSize: '14px', color: '#9CA0A1' }}>View All Supporting Documents <span>›</span></a>
      ) : null}
    </div>
  )
}