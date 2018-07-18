import React, { Component } from 'react';
import domtoimage from 'dom-to-image';
import StepOne from './step-one';
import StepTwo from './step-two';

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
    }, 500)
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
                propertyForm={this.state.propertyForm}
                handlePropertyChange={this.handlePropertyChange}
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