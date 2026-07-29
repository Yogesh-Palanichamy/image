import { Link } from "react-router-dom";
function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    AI Adaptation Tool
                </Link>
                <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="nav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/dashboard">Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/upload">Upload Dataset</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/image-upload">Upload Image</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/video-upload">Upload Video</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/live-camera">Live Camera</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/training">Training</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/prediction">Prediction</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;