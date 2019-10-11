/* eslint-disable no-loop-func */

import React, { Component } from 'react';
import domtoimage from 'dom-to-image';
import ipfsAPI from 'ipfs-http-client';
import { OIP } from 'js-oip';
import { PropertyTenure, PropertySpatialUnit, PropertyParty } from 'js-oip/lib/modules/records/artifact';
import { Insight } from 'insight-explorer'

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
    this.ipfsApi = ipfsAPI('34.82.102.62', '5001')
    // publicAddress = 'oKY4JuqYZDBpGwGoWCLLJn1ZJZobhVRXjE'
    this.publisherPrivateAddress = 'cW5daMp4XPAvibeQxZWQKC38NgPPVRsScuBCdzE16FMEqU7Lzr2a'
    this.oip = new OIP(this.publisherPrivateAddress, 'testnet')
    this.namespace = "MLG.PAYMENT.DEMO"

    // Set wallet to use MLG Web Explorer
    this.oip.wallet.explorer = new Insight('https://testnet.explorer.mediciland.com/api')

    this.ipfsPin = this.ipfsPin.bind(this)
    this.saveToIpfs = this.saveToIpfs.bind(this)
    this.ipfsGetFile = this.ipfsGetFile.bind(this)
    this.publishGrantor = this.publishGrantor.bind(this)
    this.publishGrantee = this.publishGrantee.bind(this)
    this.publishSpatialUnit = this.publishSpatialUnit.bind(this)
    this.publishTenure = this.publishTenure.bind(this)
    this.publishPropertyRecord = this.publishPropertyRecord.bind(this)
    this.handlePropertyChange = this.handlePropertyChange.bind(this)
    this.handleDocumentSelect = this.handleDocumentSelect.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)
    this.initMap = this.initMap.bind(this)
    this.initAutocomplete = this.initAutocomplete.bind(this)
    this.fillInAddress = this.fillInAddress.bind(this)
    this.editChange = this.editChange.bind(this)
    this.submitStepOne = this.submitStepOne.bind(this)
    this.readFilesIntoObject = this.readFilesIntoObject.bind(this)
    this.publishProperty = this.publishProperty.bind(this)
  }

  componentDidMount() {
    this.initAutocomplete()
  }

  ipfsPin(files) {
    return new Promise((resolve, reject) => {
      console.log('captureFile', files)
      if (files.length == 0) resolve("thisisadummyipfsdirectory")
      let filesCount = files.length
      let loadendCount = filesCount
      let fileAdds = []
      for (let i = 0; i < filesCount; i++) {
        let file = files[i]
        let reader = new window.FileReader()
        reader.onloadend = () => {
          fileAdds.push({ path: file.name, content: Buffer.from(reader.result) })
          if (!--loadendCount) {
            let res = this.saveToIpfs(fileAdds, resolve)
          }
        }
        reader.readAsArrayBuffer(file)
      }
    })
  }

  async saveToIpfs(fileAdds, saveIpfsCb) {
    let ipfsId
    console.log('saveToIpfs', fileAdds)

    let response = await this.ipfsApi.add(fileAdds, { progress: (prog) => console.log(`received: ${prog}`), wrapWithDirectory: true })
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

  async publishGrantor(grantorName, grantorDocs){
    let grantor = new PropertyParty()
    grantor.setNamespace(this.namespace)
    grantor.setTitle(grantorName)
    grantor.setDetail('partyName', grantorName)
    grantor.setDetail('partyType', 'GRANTOR')

    if (grantorDocs.length > 0){
      let grantorIPFSLocation = await this.ipfsPin(grantorDocs)
      grantor.setLocation(grantorIPFSLocation)
      grantorDocs.forEach((file, index, array) => {
        grantor.addFile({ fname: file.name, fsize: file.size, ctype: file.type })
      })
    }

    let grantorPublish = await this.oip.publish(grantor)

    return grantorPublish
  }

  async publishGrantee(granteeName, granteeDocs){
    let grantee = new PropertyParty()
    grantee.setNamespace(this.namespace)
    grantee.setTitle(granteeName)
    grantee.setDetail('partyName', granteeName)
    grantee.setDetail('partyType', 'GRANTEE')

    if (granteeDocs.length > 0) {
      let granteeIPFSLocation = await this.ipfsPin(granteeDocs)
      grantee.setLocation(granteeIPFSLocation)
      granteeDocs.forEach((file, index, array) => {
        grantee.addFile({ fname: file.name, fsize: file.size, ctype: file.type })
      })
    }

    let granteePublish = await this.oip.publish(grantee)

    return granteePublish
  }

  async publishSpatialUnit(spatialDocs){
    let form = this.state.propertyForm

    let spatialUnit = new PropertySpatialUnit()
    spatialUnit.setNamespace(this.namespace)
    spatialUnit.setTitle(form.spatialIdentifier)
    spatialUnit.setDetail('officialID', form.spatialIdentifier)
    spatialUnit.setDetail('spatialType', 'PARCEL')
    spatialUnit.setDetail('textual', form.legalDescription)
    spatialUnit.setDetail('addressData', this.state.manualAddress)
    spatialUnit.setDetail('spatialDataType', 'POLYGON')
    spatialUnit.setDetail('spatialData', this.state.polygonCoords)

    let attrs = {
      'RCLegal.RCSubDivision.Township': form.township ? form.township : 'Sepcapis',
      'RCLegal.RCSubDivision.Range': form.mbrange ? form.mbrange : 'Qisnou',
      'RCLegal.RCSubDivision.Section': form.section ? form.section : '1',
      'RCLegal.Unit': form.propertyUnit ? form.propertyUnit : '00',
      'RCLegal.Lot2': form.lot ? form.lot : '0000'
    }
    spatialUnit.setAttributes(attrs)

    if (spatialDocs.length > 0) {
      let spatialUnitIPFSLocation = await this.ipfsPin(spatialDocs)
      spatialUnit.setLocation(spatialUnitIPFSLocation)
      spatialDocs.forEach((file, index, array) => {
        spatialUnit.addFile({ fname: file.name, fsize: file.size, ctype: file.type })
      })
    }

    let spatialUnitPublish = await this.oip.publish(spatialUnit)

    return spatialUnitPublish
  }

  /* Payment reference

      "payment": {
        "addresses": [],
        "retailer": 15,
        "sugTip": [],
        "fiat": "USD",
        "scale": "1000:1",
        "promoter": 15,
        "maxdisc": 30
      },

   */
  async publishTenure(tenureActivityID, instrumentType, grantorTXID, granteeTXID, spatialTXID, tenureDocs) {
    let tenure = new PropertyTenure()
    tenure.setNamespace(this.namespace)
    tenure.setTitle(tenureActivityID)
    tenure.setTenureType(instrumentType.toUpperCase())
    tenure.setParties([
      {role: 'GRANTOR', party: grantorTXID},
      {role: 'GRANTEE', party: granteeTXID}
    ])
    tenure.setSpatialUnits([spatialTXID])

    // ==== Payment hack ====
    tenure.addSinglePaymentAddress("FLO", "oKY4JuqYZDBpGwGoWCLLJn1ZJZobhVRXjE")
    tenure.setRetailerCut(20)
    tenure.setPromoterCut(30)
    // ======================

    let attrs = {
      'RCRecorder.EntryNumber': tenureActivityID,
      'RCInstrument.Description': instrumentType.toUpperCase()
    }

    tenure.setAttributes(attrs)

    if (tenureDocs.length > 0) {
      let tenureIPFSLocation = await this.ipfsPin(tenureDocs)
      tenure.setLocation(tenureIPFSLocation)
      tenureDocs.forEach((file, index, array) => {
        tenure.addFile({ fname: file.name, fsize: file.size, ctype: file.type, sugBuy: 1 })
      })
    }

    let tenurePublish = await this.oip.publish(tenure)

    return tenurePublish
  }

  async publishPropertyRecord(grantorDocs, granteeDocs, spatialDocs, tenureDocs, postArtifactTxids) {
    let form = this.state.propertyForm

    // Create and publish Grantor
    let grantorPublish = await this.publishGrantor(form.grantorName, grantorDocs)
    console.log(grantorPublish)

    // Create and publish Grantee
    let granteePublish = await this.publishGrantee(form.granteeName, granteeDocs)
    console.log(granteePublish)

    // Create, upload to IPFS, and publish Spatial Unit
    let spatialUnitPublish = await this.publishSpatialUnit(spatialDocs)
    console.log(spatialUnitPublish)

    // Create, upload to IPFS, and publish Tenure
    let tenurePublish = await this.publishTenure(form.activityIdentifier,
      form.instrumentType,
      grantorPublish.txids[0],
      granteePublish.txids[0],
      spatialUnitPublish.txids[0],
      tenureDocs)
    console.log(tenurePublish)

    postArtifactTxids(grantorPublish, granteePublish, spatialUnitPublish, tenurePublish)
  }

  handlePropertyChange(e) {
    let propertyForm = this.state.propertyForm
    propertyForm[e.target.name] = e.target.value
    this.setState({ propertyForm })
  }

  handleDocumentSelect(index, e) {
    let propertyForm = this.state.propertyForm
    propertyForm.documents.map((docu, i) => {
      if (index === i) {
        docu.option.value = e.target.value
      }
      return docu
    })
    this.setState({ propertyForm })
  }

  getCurrentLocation() {
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

  initMap(position) {
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

  initAutocomplete() {
    setTimeout(() => {
      let autocomplete = this.state.autocomplete
      autocomplete = new window.google.maps.places.Autocomplete(document.getElementById('autocomplete'), { types: ['geocode'] });
      autocomplete.addListener('place_changed', this.fillInAddress)
      this.setState({ autocomplete })
    }, 500)
  }

  fillInAddress(e) {
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

  setCenterAndCreatePolygon(map) {
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

  editChange() {

    console.log(this.state.polygon.getPaths())

    var points = this.state.polygon.getPaths().g[0].g;
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

  submitStepOne (e) {
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

  readFilesIntoObject (e) {
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

  publishProperty (e) {
    e.preventDefault();
    this.setState({ loading: true })
    let map = document.getElementById('map');

    const currentDate = new Date()
    let tenureDocs = []
    let spatialDocs = []
    let grantorDocs = []
    let granteeDocs = []
    console.log('publishProperty', this.state.propertyForm.documents)
    this.state.propertyForm.documents.forEach((item) => {
      console.log(item.option.value)
      switch (item.option.value) {
        case "Tenure Document":
          tenureDocs.push(item.file)
          break
        case "Spatial Unit Document":
          spatialDocs.push(item.file)
          break
        case "Grantor Document":
          grantorDocs.push(item.file)
          break
        case "Grantee Document":
          granteeDocs.push(item.file)
          break
        default:
          tenureDocs.push(item.file)
          break
      }
    })
    this.publishPropertyRecord(grantorDocs, granteeDocs, spatialDocs, tenureDocs,
      (grantor, grantee, spatial, tenure) => {
        this.setState({
          results: {
            grantor,
            grantee,
            spatial,
            tenure
          },
          step: 3,
          loading: false
        })
        console.log('Grantor: ', grantor, ', Grantee: ', grantee, ', Location: ', spatial, ', Tenure: ', tenure)
      }
    )

    // domtoimage.toPng(map)
    //   .then(dataUrl => {
    //     let img = new Image();
    //     img.src = dataUrl;

    //     // document.body.appendChild(img);
    //   })
    //   .catch(error => {
    //     console.error('oops, something went wrong!', error);
    //   });
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
          {this.state.step === 1 ? (
            <div className="col-sm-12 col-md-8 offset-md-2">
              <StepOne
                key="step-one"
                getCurrentLocation={this.getCurrentLocation}
                fillInAddress={this.fillInAddress}
                submitStepOne={this.submitStepOne}
                propertyForm={this.state.propertyForm}
                handlePropertyChange={this.handlePropertyChange}
                loading={this.state.loading}
              />
            </div>
          ) : this.state.step === 2 ? (
            <div className="col-sm-12 col-md-8 offset-md-2">
              <StepTwo
                key="step-two"
                handlePropertyChange={this.handlePropertyChange}
                handleDocumentSelect={this.handleDocumentSelect}
                readFilesIntoObject={this.readFilesIntoObject}
                propertyForm={this.state.propertyForm}
                publishProperty={this.publishProperty}
                loading={this.state.loading}
              />
            </div>
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
    )
  }
}