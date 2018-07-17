import React from 'react';
import smallRight from '../images/small-right.svg';
import doc from '../images/doc.svg';

export const ListGroupItem = props => {
  return (
    <li className="list-group-item d-flex">
      {/*props.thumbnail ? <img src={props.thumbnail} alt=""/> : null*/}
      <div className="list-meta">
        <div className="title">{props.name}</div>
        <div className="transaction">{props.name}</div>
        <div className="author">{props.name}</div>
      </div>
      <span className="actions ml-auto">
        <button className="action-button"><img src={smallRight} alt="view document" /></button>
      </span>
    </li>
  )
}
