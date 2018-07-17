import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import Header from './components/partials/header'

import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/styles.css";

const App = () => (
  <BrowserRouter>
    <div id="app-container">
      <Header />
      <div className="app-content">
        <div className="container">      
          <Routes />
        </div>
      </div>
    </div>
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById("app"));
