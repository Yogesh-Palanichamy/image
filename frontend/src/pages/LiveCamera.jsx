import { useRef, useState } from "react";
function LiveCamera() {
    const videoRef = useRef(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [error, setError] = useState("");
    // Start Camera
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            videoRef.current.srcObject = stream;
            setCameraOn(true);
            setError("");}
        catch(error) {
            console.log(error);
            setError("Camera permission denied");
        }};
    // Stop Camera
    const stopCamera = () => {
        const stream =
        videoRef.current.srcObject;
        if(stream) {
            const tracks =
            stream.getTracks();
            tracks.forEach(track => track.stop());
        }videoRef.current.srcObject = null;
        setCameraOn(false);
    };
    return (
        <div className="container mt-5">
            <div className="card shadow p-4">
                <h2 className="text-center mb-4">Live Camera Capture</h2>
                <div className="text-center">
                    <video ref={videoRef}autoPlay playsInline width="600" className="border rounded"/>
                </div>
                <div className="text-center mt-4">
                    {!cameraOn ? <button className="btn btn-success me-3" onClick={startCamera}>Start Camera</button>:
                    <button className="btn btn-danger me-3" onClick={stopCamera} >Stop Camera</button>
                    }
                </div>
                <div className="text-center mt-3">
                    { cameraOn && <p className="text-success"> Camera is running </p> }
                    { error && <p className="text-danger"> {error} </p>}
                </div>
            </div>
        </div>
    );
}
export default LiveCamera;