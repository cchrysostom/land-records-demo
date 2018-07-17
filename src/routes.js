import React from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import Home from "./views/Home";
import Search from "./views/Search";

const Routes = () => (
  <Switch>
    <Route
      exact path="/"
      component={Home}
    />
    <Route
      path="/search"
      component={Search}
    />
    <Route path="*" render={() => <Redirect to="/" />} />
  </Switch>
);

export default Routes;
