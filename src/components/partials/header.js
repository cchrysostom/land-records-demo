import React, { Component } from 'react'
import search from '../../images/search.svg';

export default class Header extends Component {
  render() {
    return (
      <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="#">Blockchain Property Registry - Medici Land Governance</a>
        <form className="form-inline ml-md-auto">
          <div className="input-group">
            <input type="text" className="form-control header-search" placeholder="Search Transactions" aria-label="Search Transactions" aria-describedby="transaction-serach" />>
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="submit"><img src={search} alt="search"/></button>
            </div>
          </div>
        </form>
      </nav>
    )
  }
}
