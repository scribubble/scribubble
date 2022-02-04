import { h } from "preact";
import { Router } from "preact-router";
import AsyncRoute from "preact-async-route";
import { ThemeProvider } from "styled-components";
import theme from "../style/theme";

import Home from "../routes/Home";

const App = () => (
  <div id="app">
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  </div>
);

export default App;
