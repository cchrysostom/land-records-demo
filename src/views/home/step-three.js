import React, { Component } from 'react';
import { getTransaction } from '../search/api';
import TransactionDetails from '../search/TransactionDetails';
import { BrowserRouter, Route, Link } from 'react-router-dom';

import expand from '../../images/expand.svg';
import docSvg from '../../images/doc-svg.svg';

// Property Results

export default class StepThree extends Component {
  constructor(props) {
    super(props)
    this.state = {
      results: props.results || {},
      propertyForm: props.propertyForm,
      map: null,
      polygon: null,
      transactions: {
        tenure: {},
        party: {},
        spatial: {}
      },
      loading: false
    }
  }

  componentDidMount() {
    this.initMap({
      coords: {
        latitude: this.props.currentLocation.lat,
        longitude: this.props.currentLocation.lng
      }
    });
    this.getResults(this.state.results);
  }

  initMap (position) {
    setTimeout(() => {
      let map = this.state.map
      map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        mapTypeId: 'roadmap'
      })
      window.tileListener = window.google.maps.event.addListener(map, 'tilesloaded', this.setCenterAndCreatePolygon.bind(this, map));
    }, 500)
  }

  setCenterAndCreatePolygon (map) {
    let centerCoords = this.props.currentLocation;
    centerCoords.lat = parseFloat(centerCoords.lat)
    centerCoords.lng = parseFloat(centerCoords.lng)
    map.setTilt(0)

    let polygonCoords = this.props.polygonCoords;

    let polygon = this.state.polygon

    if (polygon !== null) polygon.setVisible(false)

    polygon = new window.google.maps.Polygon({
      paths: polygonCoords,
      strokeColor: '#008fff',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#008fff',
      fillOpacity: 0.35,
      editable: true,
      draggable: true,
      visible: true
    });

    polygon.setMap(map);
  }

  getResults (results) {
    let transactions = this.state.transactions;
    this.setState({loading: true})
    console.log(results)
    
    // Load results, then keep looping until the transactions have been confirmed into a block
    let getResultsLoop = setInterval(async () => {

      let tenure = getTransaction(results.tenure.txids[0])
      let grantor = getTransaction(results.grantor.txids[0])
      let grantee = getTransaction(results.grantee.txids[0])
      let spatial = getTransaction(results.spatial.txids[0])

      let allProms = await Promise.all([tenure, grantor, grantee, spatial])

      transactions.tenure = allProms[0]
      transactions.grantor = allProms[1]
      transactions.grantee = allProms[2]
      transactions.spatial = allProms[3]

      this.setState({ transactions, loading: false })

      if (transactions.tenure.blockhash && transactions.tenure.blockhash !== '' &&
          transactions.grantor.blockhash && transactions.grantor.blockhash !== '' &&
          transactions.grantee.blockhash && transactions.grantee.blockhash !== '' &&
          transactions.spatial.blockhash && transactions.spatial.blockhash !== '')
        clearInterval(getResultsLoop)
    }, 1000)

  }

  render() {

    let documents = this.state.propertyForm.documents.map((docu, i) => {
      return (
        <li className="list-group-item d-flex" key={docu.file.name + i}>
          {docu.file.thumbnail ? <img src={docu.file.thumbnail} alt="" /> : (
            <div className="document">
              <img src={docSvg} alt="document" />
            </div>
          )}
          <div className="list-meta">
            <div className="title">{docu.file.name}</div>
            <div className="description">{docu.option.value}</div>
          </div>
          <span className="actions ml-auto">
            <button className="action-button"><img src={expand} alt="expand document" /></button>
          </span>
        </li>
      )
    })

    return (
      <BrowserRouter basename="/">
        <div className="w-100">
          <Route exact path="/" render={props => {
            return (
              <div className="col-sm-12 col-md-8 offset-md-2">
                <div className="row mt-5">
                  <div className="col-sm-12 col-md-8 offset-md-2">
                    <h3>{this.state.propertyForm.spatialIdentifier}</h3>
                    <div className="map-container">
                      <div id="map"></div>
                    </div>
                    <div className="form-group property-description mt-3">
                      <label>{this.state.propertyForm.legalDescription}</label>
                    </div>
                    <hr className="mb-2 mt-3" />
                    <div className="form-group mb-0">
                      <label>Supporting Documents</label>
                    </div>
                    <ul className="list-group" style={{ marginBottom: '2.2rem' }}>
                      {documents}
                    </ul>
                    <hr />
                    <div className="form-group mt-4">
                      <label>Blockchain Status</label>
                      <textarea
                        className="form-control bg-white"
                        rows="10"
                        disabled="true"
                        style={{
                          fontSize: '14px',
                          lineHeight: '20px'
                        }}
                        defaultValue={`Tenure: ${this.state.results.tenure.txids}
Grantor Party: ${this.state.results.grantor.txids}
Grantee Party: ${this.state.results.grantee.txids}
Spatial Unit: ${this.state.results.spatial.txids}`}
                      >
                      </textarea>
                    </div>
                    <div className="m-auto text-center">
                      <Link className="btn btn-primary" to="/transaction-details">{this.state.loading === true ? <i className="fa fa-spinner fa-spin fa-fw"></i> : 'View Blockchain'}</Link>
                      {/*<a className="btn btn-primary" href={`https://testnet.explorer.mediciland.com/tx/${this.state.results.tenure}`} target="_blank">View Blockchain</a>*/}
                    </div>
                  </div>
                </div>
              </div>
            )
          }} />
          <Route path="/transaction-details" render={props => <TransactionDetails {...props} transactions={this.state.transactions} results={this.state.results} />} />
        </div>
      </BrowserRouter>
    )
  }
}
