import React from 'react';

export const TransactionCard = props => {
  let icon = '';
  return (
    <div className="col-sm-12 col-md-4">
      <div className="transaction-card-title"><i className="transaction-card-icon"></i> {props.title}</div>
      <div className={`card ${props.color}`}>
        <div className="card-body">
          <h5 className="card-title">Card title <span>{/* transaction id */}</span></h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <div className="d-flex">
                <span className="mr-auto"><strong>Size:</strong></span>
                <span className="ml-auto">1103 (bytes)</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Fee:</strong></span>
                <span className="ml-auto">0.00372272 FLO</span>
              </div>
            </li>
            <li class="list-group-item">
              <div><strong>Included in Block:</strong></div>
              {/* 695638af0ddd2741c8c1b95432a98003ceddc76b8fd08656c559 */}
            </li>
            <li class="list-group-item mb-5">
              <div className="d-flex">
                <span className="mr-auto"><strong>Received Time:</strong></span>
                <span className="ml-auto">Jul 2, 2018 1:13:18 PM</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Mined Time:</strong></span>
                <span className="ml-auto">Jul 2, 2018 1:13:18 PM</span>
              </div>
              <div className="d-flex">
                <span className="mr-auto"><strong>Lock Time:</strong></span>
                <span className="ml-auto">160939</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <a>View Full Transaction Details <span>›</span></a>
      <a>View All Supporting Documents <span>›</span></a>
    </div>
  )
}