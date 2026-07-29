import { useState } from "react";
import API from "../services/api";
function Upload(){
    const [file,setFile] = useState(null);
    const [progress,setProgress] = useState(0);
    const [message,setMessage] = useState("");
    const uploadDataset = async()=>{
        if(!file){
            alert("Select dataset first");
            return;
        }
        const formData = new FormData();
        formData.append("dataset",file);
        try{
            const response = await API.post("/upload/dataset",formData,
                {headers:{"Content-Type":"multipart/form-data"},
                    onUploadProgress:(event)=>{const percent =Math.round((event.loaded * 100) /event.total);
                        setProgress(percent);
                    }
                }
            );
            setMessage(response.data.message);
        }
        catch(error){
            console.log(error);
            setMessage("Upload Failed");
        }
    }
    return(
        <div className="container mt-5">
            <h2>Upload Dataset</h2>
            <div className="card p-4">
            <input type="file" className="form-control"
            onChange={
                e=>setFile(e.target.files[0])
            }/>
            <button className="btn btn-primary mt-3" onClick={uploadDataset}>Upload Dataset</button>
            {
            progress>0 && <div className="progress mt-4">
            <div className="progress-bar"
            style={{ width:`${progress}%`}}>
            {progress}%
            </div>
            </div>}
            <p className="mt-3">{message}
            </p>
            </div>
        </div>
)}
export default Upload;