import React, { Component } from 'react';
import axios from 'axios';
import { getTransaction } from './api';

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
      polygon: null
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

  initMap = (position) => {
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

  setCenterAndCreatePolygon = (map) => {
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

  getResults = (results) => {
    console.log(results)
    setTimeout(() => {
      axios
        .all([
          getTransaction(results.tenure),
          getTransaction(results.party),
          getTransaction(results.spatial),
        ])
        .then(axios.spread((tenure, party, spatial) => {
          console.log(tenure)
          console.log(party)
          console.log(spatial)
        }))
        .catch(error => {
          console.log(error)
        });
    }, 10000)
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
      <div className="row mt-5">
        <div className="col-sm-12 col-md-8 offset-md-2">
          <h3>{this.state.propertyForm.spatialName}</h3>
          <div className="map-container">
            <div id="map"></div>
          </div>
          <div className="form-group property-description mt-3">
            <label>{this.state.propertyForm.spatialDescription}</label>
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
              defaultValue={`Tenure:
${this.state.results.tenure}
Party:
${this.state.results.party}
Spatial:
${this.state.results.spatial}`}
            >
            </textarea>
          </div>
          <div className="m-auto text-center">
            <a className="btn btn-primary" href={`https://testnet.flocha.in/tx/${this.state.results.tenure}`} target="_blank">View Blockchain</a>
          </div>
        </div>
      </div>
    )
  }
}
