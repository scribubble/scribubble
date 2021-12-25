
import { Link } from 'preact-router/match';

const Home = () => {
	return (
		<div id="main">
			<nav>
				<Link activeClassName="active" href="/web">
					PC 버전으로
				</Link>
				<br/>
				<Link activeClassName="active" href="/vr">
					VR 버전으로
				</Link>
			</nav>
		</div>
	);
}

export default Home;
