import React, { Component } from 'react';
import domtoimage from 'dom-to-image';
import ipfsAPI from 'ipfs-api';
import StepOne from './step-one';
import StepTwo from './step-two';
import StepThree from './step-three';

export default class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: 1,
      loading: false,
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
        partyName: '',
        spatialName: '',
        description: '',
        documents: []
      },
      toastActive: false,
      toastMessage: '',
      results: {}
    }
    this.ipfsApi = ipfsAPI('35.230.92.250', '5001')
    this.publisher = 'oRnG68BqvRw2qiS8sRbsuEfpRHeFtPDPpr'
  }

  componentDidMount() {
    this.initAutocomplete()
  }

  captureFile(files, captureFileCb) {
    let filesCount = files.length
    let loadendCount = filesCount
<<<<<<< HEAD
    let readers = []
    for (let i = 0; i < filesCount; i++) {
      let file = files[i].file
      let reader = new window.FileReader()
      reader.onloadend = () => {
        readers.push(reader)
        if (!--loadendCount) this.saveToIpfs(readers, captureFileCb)
=======
    let fileAdds = []
    for (let i=0; i < filesCount; i++) {
      let file = files[i]
      let reader = new window.FileReader()
      reader.onloadend = () => { 
        fileAdds.push({path: file.name, content: Buffer.from(reader.result)})
        if (!--loadendCount) this.saveToIpfs(fileAdds, captureFileCb)
>>>>>>> 4b5de71ebb4ea670b9d8336b4b2bbb77ccd5fc10
      }
      reader.readAsArrayBuffer(file)
    }
  }

<<<<<<< HEAD
  saveToIpfs(readers, saveIpfsCb) {
=======
  saveToIpfs (fileAdds, saveIpfsCb) {
>>>>>>> 4b5de71ebb4ea670b9d8336b4b2bbb77ccd5fc10
    let ipfsId
    console.log('saveToIpfs', fileAdds)

    this.ipfsApi.add(fileAdds, { progress: (prog) => console.log(`received: ${prog}`), wrapWithDirectory: true })
      .then((response) => {
        console.log(response)
        // Grab last hash for IPFS dag. Assuming it is the last response.
        ipfsId = response[response.length - 1].hash
        saveIpfsCb(ipfsId)
      }).catch((err) => {
        console.error(err)
        this.setState({ loading: false })
      })
  }

  ipfsGetFile(ipfsHash, fileDownloaded) {
      this.ipfsApi.files.get((err, files) => {
        if (err) {
          console.log(err)
          return
        }

        files.forEach((file) => {
          console.log('ipfsGetFile', file.path)
          console.log('ipfsGetFile', file.content)

          const downloadedFile = new File(Buffer.from(file.content), file.path)
          fileDownloaded(downloadedFile)
        })
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
        // save this transaction pointer to state in array of transactions
        sendResult(json)
      })

  }

  createParty(partyName, partyDescription, partyYear, postPartyTxid) {
    let ts = Math.round((new Date()).getTime() / 1000);
    let dummyLocation = 'dummylocationforparty'
    let sigPreimage = dummyLocation + '-' + this.publisher + '-' + ts.toString()

    let pubArtifact = {
      oip042:
      {
        publish: {
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

    this.oipSign({ address: this.publisher, text: sigPreimage },
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

    let pubSpat = {
      oip042:
      {
        publish: {
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

    this.oipSign({ address: this.publisher, text: sigPreimage },
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
    let ipfsDAG = 'dummyipfsaddressforthistenure'
    let ipfsFiles = []

    this.captureFile(this.state.propertyForm.documents, (ipfsLocation) => {
      ipfsDAG = ipfsLocation
      this.state.propertyForm.documents.forEach((f, index, array) => {
        ipfsFiles.push({ fName: f.name, fSize: f.size, cType: f.type })
      })

      let sigPreimage = ipfsDAG + '-' + this.publisher + '-' + ts.toString()
      let pubTenure = {
        oip042:
        {
          publish: {
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
                location: ipfsDAG,
                files: ipfsFiles
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

      this.oipSign({ address: this.publisher, text: sigPreimage },
        (sigText) => {
          pubTenure.oip042.publish.artifact.signature = sigText
          this.oipSend(pubTenure, (pubResult) => {
            postTenureTxid(pubResult.response[0])
          })
        }
      )
    })
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

  handleDocumentSelect = (index, e) => {
    let propertyForm = this.state.propertyForm
    propertyForm.documents.map((docu, i) => {
      if(index === i) {
        docu.option.value = e.target.value
      }
      return docu
    })
    this.setState({propertyForm})
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
        loading: false,
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
      let doc = {
        file: e.target.files[file],
        option: {
          key: 0,
          value: ''
        }
      }
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
    this.setState({ loading: true })
    let map = document.getElementById('map');

    const currentDate = new Date()
    this.publishPropertyRecord(this.state.propertyForm.partyName,
      this.state.propertyForm.partyName + " long description",
      currentDate.getFullYear(),
      this.state.propertyForm.spatialName,
      this.state.propertyForm.spatialDescription,
      currentDate.getFullYear(),
      [],
      this.state.polygonCoords,
      [],
      this.state.propertyForm.partyName + ' ' + this.state.propertyForm.spatialName,
      this.state.propertyForm.partyName + ' ownership of ' + this.state.propertyForm.spatialName,
      currentDate.getFullYear(),
      this.state.propertyForm.documents,
      (party, spatial, tenure) => {
        this.setState({
          results: {
            party: party,
            spatial: spatial,
            tenure: tenure
          },
          step: 3,
          loading: false
        })
        console.log('Party: ' + party + ', Location: ' + spatial + ', Tenure: ' + tenure)
      }
    )

    domtoimage.toPng(map)
      .then(dataUrl => {
        let img = new Image();
        img.src = dataUrl;
        
        // document.body.appendChild(img);
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
                propertyForm={this.state.propertyForm}
                handlePropertyChange={this.handlePropertyChange}
                loading={this.state.loading}
                />
              ) : this.state.step === 2 ? (
                <StepTwo
                key="step-two"
                handlePropertyChange={this.handlePropertyChange}
                handleDocumentSelect={this.handleDocumentSelect}
                readFilesIntoObject={this.readFilesIntoObject}
                propertyForm={this.state.propertyForm}
                publishProperty={this.publishProperty}
                loading={this.state.loading}
              />
            ) : (
                  <StepThree
                    propertyForm={this.state.propertyForm}
                    currentLocation={this.state.currentLocation}
                    polygonCoords={this.state.polygonCoords}
                    results={this.state.results}
                  />
                )}
          </div>
        </div>
      </div>
    )
  }
}