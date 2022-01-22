import { h } from "preact";
import { Router } from "preact-router";
import AsyncRoute from "preact-async-route";

import Home from "../routes/Home";

const App = () => (
  <div id="app">
    <Router>
      <Home path="/" />
      <AsyncRoute
        path="/web"
        getComponent={() =>
          import("../routes/Scribubble").then((module) => module.default)
        }
      ></AsyncRoute>
      <AsyncRoute
        path="/vr"
        getComponent={() =>
          import("../routes/ScribubbleVR").then((module) => module.default)
        }
      ></AsyncRoute>
    </Router>
  </div>
);

export default App;
