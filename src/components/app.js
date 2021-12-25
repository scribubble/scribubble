import { h } from 'preact';
import { Router } from 'preact-router';

import Home from '../routes/home';
import Scribubble from '../routes/scribubble';

const App = () => (
	<div id="app">
		<Router>
			<Home path="/"/>
			<Scribubble path="/vr" />
		</Router>
	</div>
)

export default App;
