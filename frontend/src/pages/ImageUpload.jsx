import {useState} from "react";
import API from "../services/api";
function ImageUpload(){
    const [image,setImage]=useState(null);
    const [preview,setPreview]=useState("");
    const uploadImage=async()=>{
    const formData=new FormData();
    formData.append("image", image );
    try{
        const res=await API.post("/upload/image", formData,{ headers:{"Content-Type": "multipart/form-data"}});
        alert(res.data.message);
    }
    catch(err){
        console.log(err);
    }}
    return(
    <div className="container mt-5">
        <h2>Upload Image</h2>
        <input type="file" className="form-control" accept="image/*" onChange={(e)=>{
            setImage(e.target.files[0]);
            setPreview(
                URL.createObjectURL( e.target.files[0] ))
            }}/>{preview && <img src={preview} width="300" className="mt-3" />}<button className="btn btn-success mt-3" onClick={uploadImage}>Upload Image</button></div>
        )
    }
export default ImageUpload;