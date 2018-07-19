import React from 'react'

const StepOne = props => {
  const btnStyles = {
    minWidth: '200px'
  }
  return (
    <div className="text-center mt-5">
      <h1 className="mb-5">Welcome!<br />Please input your name &amp; location.</h1>
      <form onSubmit={props.submitStepOne}>
        <div className="m-auto" style={{ maxWidth: '480px' }}>
          <div className="form-group mb-5">
            <label className="text-left d-block ml-2 mb-2">Name</label>
            <input
              type="text"
              name="partyName"
              required
              value={props.propertyForm.partyName}
              className="form-control mb-3"
              placeholder="Your Name"
              onChange={props.handlePropertyChange}
            />
          </div>
        </div>
        <hr />
        <div className="m-auto" style={{ maxWidth: '480px' }}>
          <div className="form-group mt-5">
            <label className="text-left d-block ml-2 mb-2">Address</label>
            <input
              type="text"
              id="autocomplete"
              name="manualAddress"
              required
              value={props.manualAddress}
              className="form-control mb-3"
              placeholder="Enter Address"
              onChange={props.fillInAddress}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-sm mb-5" style={{ minWidth: '145px' }}>Search</button>
      </form>
      <div className="hr-line mb-5">
        <span>or</span>
      </div>
      <button type="button" className="btn btn-outline-primary btn-sm mb-5" style={btnStyles} onClick={props.getCurrentLocation}>Use My Current Location</button>
    </div>
  )
}

export default StepOne