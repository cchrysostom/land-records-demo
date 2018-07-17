import React, { Component } from 'react';
import domtoimage from 'dom-to-image';

import remove from '../images/remove.svg';

export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      map: null,
      polygon: null,
      polygonCoords: [],
      currentLocation: {
        lat: '',
        lng: ''
      },
      autocomplete: null,
      manualAddress: '',
      propertyForm: {
        name: '',
        description: '',
        documents: []
      },
      toastActive: false,
      toastMessage: ''
    }
  }

  componentDidMount() {
    this.initAutocomplete()
  }

  handlePropertyChange = (e) => {
    let propertyForm = this.state.propertyForm
    propertyForm[e.target.name] = e.target.value
    this.setState({ propertyForm })
  }

  getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(success => {
      this.setState({
        currentLocation: {
          lat: success.coords.latitude,
          lng: success.coords.longitude
        },
        step: 2
      }, this.initMap(success))
    }, error => {
      this.setState({
        toastActive: true,
        toastMessage: 'Could not get your location.'
      }, () => {
        setTimeout(() => {
          this.setState({
            toastActive: false,
            toastMessage: ''
          })
        }, 3000)
      })
    }, {
        enableHighAccuracy: true,
        timeout: 10000
      })
  }

  initMap = (position) => {
    setTimeout(() => {
      let map = this.state.map
      map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        mapTypeId: 'roadmap'
        // mapTypeId: 'hybrid'
      })
      window.tileListener = window.google.maps.event.addListener(map, 'tilesloaded', this.setCenterAndCreatePolygon.bind(this, map));
    }, 500)
  }

  initAutocomplete = () => {
    setTimeout(() => {
      let autocomplete = this.state.autocomplete
      autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('autocomplete'), { types: ['geocode'] });
      autocomplete.addListener('place_changed', this.fillInAddress)
      this.setState({ autocomplete })
    }, 0)
  }

  fillInAddress = (e) => {
    let event = { ...e };

    this.setState({ manualAddress: event.target && event.target.value ? event.target.value : '' }, () => {
      var place = this.state.autocomplete.getPlace();
      if (place) this.setState({ manualAddress: place.formatted_address })

      var centerCoords;

      if (place && place.geometry) {
        centerCoords = {
          "lat": place.geometry.location.lat(),
          "lng": place.geometry.location.lng()
        }
      } else {
        var inputValue = event.target.value;
        var coordArr = inputValue.split(", ")
        if (coordArr.length === 2) {
          centerCoords = {
            "lat": parseFloat(coordArr[0]),
            "lng": parseFloat(coordArr[1])
          }
        } else {
          return
        }
      }

      this.setState({ currentLocation: centerCoords })
    })
  }

  setCenterAndCreatePolygon = (map) => {
    let centerCoords = this.state.currentLocation;
    centerCoords.lat = parseFloat(centerCoords.lat)
    centerCoords.lng = parseFloat(centerCoords.lng)
    map.setTilt(0)

    let polygonCoords = this.state.polygonCoords;

    polygonCoords.push({ "lat": centerCoords.lat - 0.001, "lng": centerCoords.lng - 0.001 })
    polygonCoords.push({ "lat": centerCoords.lat - 0.001, "lng": centerCoords.lng + 0.001 })
    polygonCoords.push({ "lat": centerCoords.lat + 0.001, "lng": centerCoords.lng + 0.001 })
    polygonCoords.push({ "lat": centerCoords.lat + 0.001, "lng": centerCoords.lng - 0.001 })

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

    polygon.addListener('mouseup', this.editChange);
    polygon.setMap(map);
    this.setState({ polygon: polygon, polygonCoords: polygonCoords }, () => {
      window.google.maps.event.removeListener(window.tileListener);
    })

  }

  editChange = () => {
    var points = this.state.polygon.getPaths().b[0].b;
    var newPolyPoints = [];
    for (var point of points) {
      var lat = point.lat();
      var lng = point.lng();
      newPolyPoints.push({ lat: lat, lng: lng })
    }
    this.setState({
      polygonCoords: newPolyPoints
    })
  }

  submitStepOne = (e) => {
    e.preventDefault();
    if (this.state.manualAddress !== '') {
      this.setState({
        step: 2
      }, () => {
        this.initMap({
          coords: {
            latitude: this.state.currentLocation.lat,
            longitude: this.state.currentLocation.lng
          }
        })
      })
    }
  }

  readFilesIntoObject = (e) => {
    let propertyForm = this.state.propertyForm
    Object.keys(e.target.files).forEach(file => {
      let doc = e.target.files[file];
      // if(doc.type.split('/')[0] === 'image') {
      //   var reader = new FileReader();
      //   reader.onload = (e) => {
      //     doc.thumbnail = e.target.result
      //     propertyForm.documents.push(doc);
      //   }
      //   reader.readAsDataURL(doc);
      // } else {
      propertyForm.documents.push(doc);
      // }      
    })
    this.setState({ propertyForm })
  }

  publishProperty = (e) => {
    e.preventDefault();
    let map = document.getElementById('map');

    domtoimage.toPng(map)
      .then(dataUrl => {
        var img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img);
      })
      .catch(error => {
        console.error('oops, something went wrong!', error);
      });
  }

  render() {
    console.log(this.state)
    return (
      <div>
        <div className={`toast ${this.state.toastActive ? 'show' : 'hide'}`}>
          <div className="message">
            {this.state.toastMessage}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            {this.state.step === 1 ? (
              <StepOne
                key="step-one"
                getCurrentLocation={this.getCurrentLocation}
                fillInAddress={this.fillInAddress}
                submitStepOne={this.submitStepOne}
              />
            ) : (
                <StepTwo
                  key="step-two"
                  handlePropertyChange={this.handlePropertyChange}
                  readFilesIntoObject={this.readFilesIntoObject}
                  propertyForm={this.state.propertyForm}
                  publishProperty={this.publishProperty}
                />
              )}
          </div>
        </div>
      </div>
    )
  }
}


const StepOne = props => {
  const btnStyles = {
    minWidth: '200px'
  }
  return (
    <div className="text-center mt-5">
      <h1 className="mb-5">Welcome!<br />Please input your location to start.</h1>
      <button type="button" className="btn btn-outline-primary btn-sm mb-5" style={btnStyles} onClick={props.getCurrentLocation}>Use My Current Location</button>
      <div className="hr-line mb-5">
        <span>or</span>
      </div>
      <div className="m-auto" style={{ maxWidth: '480px' }}>
        <form onSubmit={props.submitStepOne}>
          <div className="form-group">
            <input
              type="text"
              id="autocomplete"
              name="manualAddress"
              value={props.manualAddress}
              className="form-control mb-3"
              placeholder="Enter Address"
              onChange={props.fillInAddress}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: '145px' }}>Search</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const StepTwo = props => {
  console.log(props)
  let documents = props.propertyForm.documents.map((file, i) => {
    return (
      <li className="list-group-item d-flex" key={file.name + i}>
        {/*file.thumbnail ? <img src={file.thumbnail} alt=""/> : null*/}
        <div className="list-meta">
          <div className="title">{file.name}</div>
          <select name="type" className="form-control mt-2">
            <option value="">Please select document type</option>
            <option value="ownership">This document proves ownership.</option>
            <option value="location">This document proves location.</option>
            <option value="other">Other (uncategorized).</option>
          </select>
        </div>
        <span className="actions ml-auto">
          <button className="action-button"><img src={remove} alt="remove document"/></button>
        </span>
      </li>
    )
  })

  return (
    <div className="mt-5">
      <div className="map-container mb-5">
        <div id="map"></div>
      </div>
      <div style={{ maxWidth: '480px' }} className="m-auto">
        <div className="form-group">
          <label>Property Name (Required)</label>
          <input name="name" value={props.propertyForm.name} type="text" placeholder="Enter Text" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Property Description (Optional)</label>
          <textarea name="description" value={props.propertyForm.description} rows="5" placeholder="Enter Text" className="form-control" onChange={props.handlePropertyChange}></textarea>
        </div>
        <div className="form-group">
          <label className="d-block">Add Supporting Documents (Optional)</label>
          <input type="file" name="documents" id="documents" placeholder="Choose Files" className="inputfile btn btn-sm btn-outline-primary d-block" style={{ minWidth: '200px' }} onChange={props.readFilesIntoObject} multiple />
          <label htmlFor="documents" className="d-block d-md-inline-block">Choose Files</label>
        </div>
        {props.propertyForm.documents.length > 0 ? (
          <div className="form-group form-files">
            <ul className="list-group">
              {documents}
            </ul>
          </div>
        ) : null}
        <div className="form-group mb-5">
          <textarea rows="12" className="form-control" placeholder="Upload Documents support this property belongs to you. (eg. JPG, PNG, PDF, TIFF, TXT, MPEG3, MPEG4)"></textarea>
        </div>
        <div className="form-group m-auto text-center">
          <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: '180px' }} onClick={props.publishProperty}>Publish Property</button>
        </div>
      </div>
    </div>
  )
}