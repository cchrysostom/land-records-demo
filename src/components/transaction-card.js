import React from 'react';
import moment from 'moment';

export const TransactionCard = props => {
  console.log(props)
  let tx = props.transaction;
  let icon = '';
  let floData = JSON.parse(tx.floData.slice(5, tx.floData.length))
  let location = floData.oip042.publish.artifact.storage.location
  return (
    <div className="col-sm-12 col-md-4">
      <div className={`transaction-card-title pl-3 mb-2 ${props.color}`}><i className="transaction-card-icon"></i> {props.type} Information</div>
      <div className={`card ${props.color}`}>
        <div className="card-body p-0">
          <h5 className="card-title p-2"><strong>Transaction Id:</strong><br />{tx.txId}</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <div className="d-flex">
                <span className="mr-auto"><strong>Size:</strong></span>
                <span className="ml-auto">{tx.size} (bytes)</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Fee:</strong></span>
                <span className="ml-auto">{tx.fee} FLO</span>
              </div>
            </li>
            <li className="list-group-item">
              <div><strong>Included in Block:</strong></div>
              {tx.blockhash !== undefined ? tx.blockhash : 'Pending...'}
            </li>
            <li className="list-group-item mb-5">
              <div className="d-flex">
                <span className="mr-auto"><strong>Received Time:</strong></span>
                <span className="ml-auto">{moment(Date(tx.received)).format("MMM D, YYYY h:mm:ss A")}</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Mined Time:</strong></span>
                <span className="ml-auto">{moment(Date(tx.received)).format("MMM D, YYYY h:mm:ss A")}</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Lock Time:</strong></span>
                <span className="ml-auto">{moment(Date(tx.locktime)).format("MMM D, YYYY h:mm:ss A")}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <a href={`https://flosight.mk1.alexandria.io/api/tx/${tx.txId}`} target="_blank" className="d-block pl-3 mb-2 mt-2" style={{ fontSize: '14px', color: '#9CA0A1' }}>View Full Transaction Details <span>›</span></a>
      {location !== '' && !location.includes('dummy') ? (
        <a href={`https://ipfs.io/ipfs/${location}`} target="_blank" className="d-block pl-3 mb-3" style={{ fontSize: '14px', color: '#9CA0A1' }}>View All Supporting Documents <span>›</span></a>
      ) : null}
    </div>
  )
}