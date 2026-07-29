import {useState} from "react";
function Training(){
const [progress,setProgress]=useState(0);
const startTraining=()=>{
let value=0;
const timer=setInterval(()=>{
value+=10;
setProgress(value);
if(value>=100)
{clearInterval(timer);}},500);}
return(
<div className="container mt-5">
    <h2>Model Training</h2>
    <div className="card p-4">
        <h5>Dataset:Poultry Dataset</h5>
        <h5>Model:CNN</h5>
        <button className="btn btn-danger" onClick={startTraining}>Start Training</button>
        <div className="progress mt-4">
            <div className="progress-bar" style={{ width:`${progress}%` }}>
                {progress}%
            </div>
        </div>
    </div>
</div>
)}
export default Training;