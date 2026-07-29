import { useState } from "react";
import API from "../services/api";
function VideoUpload(){
    const [video,setVideo] = useState(null);
    const [progress,setProgress] = useState(0);
    const [message,setMessage] = useState("");
    const uploadVideo = async()=>{
        if(!video){
            alert("Select video first");
            return;
        }
        const formData = new FormData();
        formData.append("video",video );
        try{
            const response = await API.post("/upload/video", formData,{
                headers:{"Content-Type": "multipart/form-data"},
                onUploadProgress:(event)=>{
                    const percent =
                    Math.round(
                        (event.loaded*100)/event.total);
                    setProgress(percent);
                }});
            setMessage(response.data.message);
        }
        catch(error){
            console.log(error);
            setMessage("Upload failed");
        }
    }
return(
    <div className="container mt-5">
        <h2>Upload Video</h2>
        <div className="card p-4">
            <input type="file" accept="video/*" className="form-control" onChange={(e)=>setVideo(e.target.files[0])}/>
            <button className="btn btn-primary mt-3" onClick={uploadVideo}>Upload Video</button>
            {progress>0 && <div className="progress mt-3">
                <div className="progress-bar" style={{ width:`${progress}%` }}> 
                    {progress}%
                </div>
            </div>
            }
            <p>{message}</p>
        </div>
    </div>
)}
export default VideoUpload;