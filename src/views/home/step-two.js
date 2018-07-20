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
            <option value="">Please select document type</option>
            <option value="This document proves ownership.">This document proves ownership.</option>
            <option value="This document proves location.">This document proves location.</option>
            <option value="Other">Other (uncategorized).</option>
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
          <label>Property Name (Required)</label>
          <input name="spatialName" value={props.propertyForm.spatialName} type="text" placeholder="Enter Text" className="form-control" onChange={props.handlePropertyChange} />
        </div>
        <div className="form-group">
          <label>Property Description (Required)</label>
          <textarea name="spatialDescription" value={props.propertyForm.spatialDescription} rows="5" placeholder="Enter Text" className="form-control" onChange={props.handlePropertyChange}></textarea>
        </div>
        <div className="form-group">
          <label className="d-block mb-3">Add Supporting Documents (Optional)</label>
          <input type="file" name="documents" id="documents" placeholder="Choose Files" className="inputfile btn btn-sm btn-outline-primary d-block" style={{ minWidth: '200px' }} onChange={props.readFilesIntoObject} multiple />
          <label htmlFor="documents" className="d-block d-md-inline-block">Choose Files</label>
        </div>
        {props.propertyForm.documents.length > 0 ? (
          <div className="form-group form-files">
            <ul className="list-group">
              {documents}
            </ul>
          </div>
        ) : (
          <div className="form-group mb-5">
            <textarea rows="12" className="form-control bg-white" disabled="true" placeholder="Upload Documents supporting this property belongs to you. (eg. JPG, PNG, PDF, TIFF, TXT, MPEG3, MPEG4)"></textarea>
          </div>
        )}
        <div className="form-group m-auto text-center">
          <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: '180px' }} onClick={props.publishProperty}>{props.loading === true ? <i className="fa fa-spinner fa-spin fa-fw"></i> : 'Publish Property'}</button>
        </div>
      </div>
    </div>
  )
}

export default StepTwo