import React, { Component } from 'react';
import domtoimage from 'dom-to-image';
import ipfsAPI from 'ipfs-api';
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
    this.ipfsApi = ipfsAPI('35.230.92.250', '5001')
    this.publisher = 'oRnG68BqvRw2qiS8sRbsuEfpRHeFtPDPpr'
  }

  componentDidMount() {
    this.initAutocomplete()
  }

  captureFile (files) {
    let filesCount = files.length
    let loadendCount = filesCount
    let readers = []
    for (let i=0; i < filesCount; i++) {
      let file = files[i]
      let reader = new window.FileReader()
      reader.onloadend = () => { 
        readers.push(reader)
        if (!--loadendCount) this.saveToIpfs(readers)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  saveToIpfs (readers) {
    let ipfsId
    console.log(readers)
    let buffers = []
    readers.forEach((r) => {
      let buffer = Buffer.from(r.result)
      buffers.push(buffer)
    })

    this.ipfsApi.add(buffers, { progress: (prog) => console.log(`received: ${prog}`), wrapWithDirectory: true })
      .then((response) => {
        console.log(response)
        // Grab last hash for IPFS dag. Assuming it is the last response.
        ipfsId = response[response.length-1].hash
        this.setState({storage_location: ipfsId}) 
      }).catch((err) => {
        console.error(err)
      })
  }

  oipSign(signRequest, signResult) {
    console.log(signRequest)
    let signHeaders = new Headers()
    signHeaders.append('Content-Type', 'application/json')

    let postInit = {
      method: 'POST',
      headers: signHeaders,
      body: JSON.stringify(signRequest)
    }

    fetch('http://35.230.92.250:41289/alexandria/v1/sign', postInit)
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        signResult(json.response[0])
      })
  }

  oipSend(sendRequest, sendResult) {
    console.log(sendRequest)
    let sendHeaders = new Headers()
    sendHeaders.append('Content-Type', 'plain/text')

    let postInit = {
      method: 'POST',
      headers: sendHeaders,
      body: 'json:' + JSON.stringify(sendRequest)
    }
    
    fetch('http://35.230.92.250:41289/alexandria/v1/send', postInit)
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        console.log('/v1/send', JSON.stringify(json))
        sendResult(json)
      })
    
  }

  createParty(partyName, partyDescription, partyYear, postPartyTxid) {
    let ts = Math.round((new Date()).getTime() / 1000);
    let dummyLocation = 'dummylocationforparty'
    let sigPreimage = dummyLocation + '-' + this.publisher + '-' + ts.toString()

    let pubArtifact = { oip042: 
      { publish: {
          artifact: {
            floAddress: this.publisher,
            timestamp: ts,
            type: 'property',
            subtype: 'party',
            info: {
              title: partyName,
              description: partyDescription,
              year: 2018
            },
            storage: {
              network: 'IPFS',
              location: dummyLocation
            },
            details: {
              ns: 'MLG',
              partyType: 'naturalPerson', partyRole: 'individual'
            },
            signature: ''
          }
        }
      }
    }

    this.oipSign({address:this.publisher,text:sigPreimage},
      (sigText) => {
        pubArtifact.oip042.publish.artifact.signature = sigText
        this.oipSend(pubArtifact, (pubResult) => {
            postPartyTxid(pubResult.response[0])
        })
      }
    )
  }

  createSpatialUnit(locationName,
     locationDescription,
     locationYear,
     files,
     polygonCoords,
     bbox,
     postSpatiTxid) {

    let ts = Math.round((new Date()).getTime() / 1000);
    let dummyLocation = 'dummyipfsaddressforthisspatialunit'
    let sigPreimage = dummyLocation + '-' + this.publisher + '-' + ts.toString()

    let pubSpat = { oip042: 
      { publish: {
          artifact: {
            floAddress: this.publisher,
            timestamp: ts,
            type: 'property',
            subtype: 'spatialUnit',
            info: {
              title: locationName,
              description: locationDescription,
              year: locationYear
            },
            storage: {
              network: 'IPFS',
              location: dummyLocation,
              files: []
            },
            details: {
              ns: 'MLG',
              spatialType: 'polygon',
              geometry: {
                type: 'geojson',
                data: { polygonCoords }
              },
              bbox: bbox
            },
            signature: ''
          }
        }
      }
    }

    this.oipSign({address:this.publisher,text:sigPreimage},
            (sigText) => {
              pubSpat.oip042.publish.artifact.signature = sigText
              this.oipSend(pubSpat, (pubResult) => {
                postSpatiTxid(pubResult.response[0])
              })
            }
        )
  }

  createTenure(tenureName,
     tenureDescription,
     tenureYearStart,
     files,
     partyTxid,
     spatialUnitTxid,
     postTenureTxid) {
    let ts = Math.round((new Date()).getTime() / 1000);
    let dummyLocation = 'dummyipfsaddressforthistenure'
    let sigPreimage = dummyLocation + '-' + this.publisher + '-' + ts.toString()

    let pubTenure = { oip042: 
      { publish: {
          artifact: {
            floAddress: this.publisher,
            timestamp: ts,
            type: 'property',
            subtype: 'tenure',
            info: {
              title: tenureName,
              description: tenureDescription,
              year: tenureYearStart
            },
            storage: {
              network: 'IPFS',
              location: dummyLocation
            },
            details: {
              ns: 'MLG',
              party: partyTxid,
              spatialUnit: spatialUnitTxid,
              tenureType: 'FREEHOLD'
            },
            signature: ''
          }
        }
      }
    }

    this.oipSign({address:this.publisher,text:sigPreimage},
        (sigText) => {
          pubTenure.oip042.publish.artifact.signature = sigText
          this.oipSend(pubTenure, (pubResult) => {
            postTenureTxid(pubResult.response[0])
          })
        }
    )
  }

  publishPropertyRecord(
    partyName,
    partyDescription,
    partyYearStart,
    locationName,
    locationDescription,
    locationYearStart,
    locationFiles,
    polygonCoords,
    bbox,
    tenureName,
    tenureDescription,
    tenureYearStart,
    tenureFiles,
    postArtifactTxids
  ) {
    let partyTxid = ''
    let spatialTxid = ''
    this.createParty(partyName, partyDescription, partyYearStart, (resultPartyTxid) => {
      partyTxid = resultPartyTxid
      this.createSpatialUnit(locationName, 
                             locationDescription, 
                             locationYearStart, 
                             locationFiles, 
                             polygonCoords, 
                             bbox, 
                             (resultSpatTxid) => {
          spatialTxid = resultSpatTxid
          this.createTenure(tenureName,
                            tenureDescription,
                            tenureYearStart,
                            tenureFiles,
                            partyTxid,
                            spatialTxid,
                            (resultTenureTxid) => {
                              postArtifactTxids(partyTxid, spatialTxid, resultTenureTxid)
                            }
                        )
        })
    })
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
    const partyName = "Jehannete the Dragonslayer"
    const partyDescription = "Slayer of dragons from The Misty Abyss"

    this.publishPropertyRecord(partyName,
                               partyDescription,
                               2018,
                               this.state.propertyForm.name,
                               this.state.propertyForm.description,
                               2018,
                               [],
                               this.state.polygonCoords,
                               [],
                               partyName + ' ' + this.state.propertyForm.name,
                               partyName + ' ownership of ' + this.state.propertyForm.name,
                               2018,
                               this.state.propertyForm.documents,
                               (party, spatial, tenure) => {
                                 console.log('Party: ' + party + ', Location: ' + spatial + ', Tenure: ' + tenure)
                               }
                              )

/*                              
    domtoimage.toPng(map)
      .then(dataUrl => {
        var img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img);
      })
      .catch(error => {
        console.error('oops, something went wrong!', error);
      });
*/
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