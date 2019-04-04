import React, { Component } from 'react'
import expand from '../images/expand.svg';

export default class UploadResults extends Component {
  constructor(props) {
    super(props)
    this.state = {
      documents: []
    }
  }

  viewBlockchain = () => {

  }

  render() {
    let documents = this.state.documents.map((doc, i) => {
      return (
        <li className="list-group-item d-flex" key={doc.name + i}>
          {/*doc.thumbnail ? <img src={doc.thumbnail} alt=""/> : null*/}
          <div className="list-meta">
            <div className="title">{doc.name}</div>
            <div className="description">{doc.name}</div>
            <div className="author">{doc.name}</div>
          </div>
          <span className="actions ml-auto">
            <button className="action-button"><img src={expand} alt="expand document" /></button>
          </span>
        </li>
      )
    })

    return (
      <div className="row">
        <div className="col-sm-12 col-md-8 offset-md-2">
          <h3>Title</h3>
          <div className="map-container">
            <div id="map"></div>
          </div>
          <div className="property-description"></div>
          <div className="property-author"></div>
          <hr />
          <h4>Supporting Documents</h4>
          <ul className="list-group">
            {documents}
          </ul>
          <hr />
          <h4>Blockchain Status</h4>
          <textarea className="form-control" rows="4">02a850ef30b64d34ec975728885290860ace32e31c02c37f360fc5c7238d494d49
          3044022039c125147b4f59ab3709ff5e9458bd2a25cb3c6af99e4910c429246de7588fc402205efa6ae25db8e87928dda392af3196f9548…</textarea>
          <div className="m-auto text-center">
            <a className="btn btn-primary" href={`https://testnet.explorer.mediciland.com/tx/${props.property.transactionId}`} target="_blank">View Blockchain</a>
          </div>
        </div>
      </div>
    )
  }
}