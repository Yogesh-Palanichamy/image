import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ImageUpload from "./pages/ImageUpload";
import Training from "./pages/Training";
import Prediction from "./pages/Prediction";
import VideoUpload from "./pages/VideoUpload";
import LiveCamera from "./pages/LiveCamera";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/image-upload" element={<ImageUpload />} />
                <Route path="/training" element={<Training />} />
                <Route path="/prediction" element={<Prediction />} />
                <Route path="/video-upload" element={<VideoUpload />}/>
                <Route path="/live-camera" element={<LiveCamera />}/>
            </Routes>
        </BrowserRouter>
    );
}
export default App;