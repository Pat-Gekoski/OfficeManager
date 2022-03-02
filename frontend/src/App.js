import SideBar from "./components/sidebar/SideBar";
import Header from "./components/header/Header";
import './App.css'


function App() {
  return (
    <div>
		<Header />
		<div className="container">
			<SideBar />
			<div className="other"></div>
		</div>
    </div>
  );
}

export default App;
