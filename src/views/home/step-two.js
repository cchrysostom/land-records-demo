import React from 'react'

import remove from '../../images/remove.svg';
import docSvg from '../../images/doc-svg.svg';

const StepTwo = props => {
  let documents = props.propertyForm.documents.map((docu, i) => {
    return (
      <li className="list-group-item d-flex" key={docu.file.name + i}>
        {docu.file.thumbnail ? <img src={docu.file.thumbnail} alt=""/> : (
          <div className="document">
            <img src={docSvg} alt="document"/>
          </div>
        )}
        <div className="list-meta">
          <div className="title">{docu.file.name}</div>
          <select name="type" className="form-control mt-2" onChange={props.handleDocumentSelect.bind(this, i)}>
            <option value="">Please select document type...</option>
            <option value="Tenure Document">This document is an Instrument</option>
            <option value="Grantor Document">This document proves Grantor identity</option>
            <option value="Grantee Document">This document proves Grantee identity</option>
            <option value="Spatial Unit Document">This document proves location</option>
            <option value="Other">Other (uncategorized)</option>
          </select>
        </div>
        <span className="actions ml-auto">
          <button className="action-button"><img src={remove} alt="remove document" /></button>
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
          <label>Property Activity or Event (Required)</label>
          <input name="activityIdentifier" value={props.propertyForm.activityIdentifier} type="text" placeholder="DEED-12-34-567" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Parcel Identifier (Required)</label>
          <input name="spatialIdentifier" value={props.propertyForm.spatialIdentifier} type="text" placeholder="12-34-567" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Legal Description (Required)</label>
          <textarea name="legalDescription" value={props.propertyForm.legalDescription} rows="5" placeholder="Legal description of the property..." className="form-control" onChange={props.handlePropertyChange}></textarea>
        </div>
        <div className="form-group">
          <label>Grantor (Required)</label>
          <input name="grantorName" value={props.propertyForm.grantorName} type="text" placeholder="Grantor Name" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Grantee (Required)</label>
          <input name="granteeName" value={props.propertyForm.granteeName} type="text" placeholder="Grantee Name" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Instrument Type (Required)</label>
          <input name="instrumentType" value={props.propertyForm.instrumentType} type="text" placeholder="Morgage, Release, Warranty Deed, etc" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Supporting Documents (Optional)</label>
          <br />
          <input type="file" name="documents" id="documents" placeholder="Choose File(s)" className="inputfile btn btn-sm btn-outline-primary d-block" style={{ minWidth: '200px' }} onChange={props.readFilesIntoObject} multiple />
          <label htmlFor="documents" className="d-block d-md-inline-block">Choose File(s)</label>
        </div>
        {props.propertyForm.documents.length > 0 ? (
          <div className="form-group form-files">
            <ul className="list-group">
              {documents}
            </ul>
          </div>
        ) : ''}
        <hr />
        <div className="form-group m-auto text-center">
          <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: '180px' }} onClick={props.publishProperty}>{props.loading === true ? <i className="fa fa-spinner fa-spin fa-fw"></i> : 'Publish Property'}</button>
        </div>
      </div>
    </div>
  )
}

export default StepTwo