import React, { Component } from 'react'
import search from '../../images/search.svg';
import mlgLogo from '../../images/mlg-logo.svg';

export default class Header extends Component {
  render() {
    return (
      <nav className="navbar fixed-top navbar-expand-lg header-container" style={{backgroundColor: '#008FFF'}}>
        <a className="navbar-brand" href="#"><img src={mlgLogo} alt="mlg" style={{width: '162px', height: '38px'}} /></a>
        <form className="form-inline ml-md-auto">
          <div className="input-group">
            <input type="text" className="form-control header-search" placeholder="Search Transactions" aria-label="Search Transactions" aria-describedby="transaction-serach" style={{border: '1px solid #fff', height: '39px'}} />
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="submit"><img src={search} alt="search"/></button>
            </div>
          </div>
        </form>
      </nav>
    )
  }
}
