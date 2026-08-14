import { useState } from "react";
import API from "../services/api";

function VideoUpload() {

    // ============================================================
    // STATE
    // ============================================================

    const [video, setVideo] =
        useState(null);

    const [progress, setProgress] =
        useState(0);

    const [uploading, setUploading] =
        useState(false);

    const [pdfLoading, setPdfLoading] =
        useState(false);

    const [result, setResult] =
        useState(null);

    const [error, setError] =
        useState("");


    // ============================================================
    // SELECT VIDEO
    // ============================================================

    const handleVideoChange = (event) => {

        const selectedVideo =
            event.target.files[0];


        if (!selectedVideo) {

            return;

        }


        setVideo(
            selectedVideo
        );


        setResult(
            null
        );


        setError(
            ""
        );


        setProgress(
            0
        );

    };


    // ============================================================
    // UPLOAD VIDEO
    // ============================================================

    const uploadVideo = async () => {

        if (!video) {

            alert(
                "Select video first"
            );

            return;

        }


        try {

            setUploading(
                true
            );


            setProgress(
                0
            );


            setResult(
                null
            );


            setError(
                ""
            );


            // ----------------------------------------------------
            // FormData
            // ----------------------------------------------------

            const formData =
                new FormData();


            formData.append(
                "video",
                video
            );


            // ----------------------------------------------------
            // API
            // ----------------------------------------------------

            const response =
                await API.post(

                    "/upload/video",

                    formData,

                    {

                        onUploadProgress:
                            (event) => {

                                if (
                                    event.total
                                ) {

                                    const percent =
                                        Math.round(

                                            (
                                                event.loaded *
                                                100
                                            ) /
                                            event.total

                                        );


                                    setProgress(
                                        percent
                                    );

                                }

                            }

                    }

                );


            console.log(
                "Video result:",
                response.data
            );


            // ----------------------------------------------------
            // CHECK RESPONSE
            // ----------------------------------------------------

            if (
                response.data.success
            ) {

                setResult(
                    response.data
                );


                setProgress(
                    100
                );


            } else {

                setError(

                    response.data.error ||

                    "Video processing failed"

                );

            }


        } catch (error) {

            console.error(
                "Video upload error:",
                error
            );


            setError(

                error.response?.data?.error ||

                error.response?.data?.details ||

                "Video processing failed"

            );


        } finally {

            setUploading(
                false
            );

        }

    };


    // ============================================================
    // DOWNLOAD PDF REPORT
    // ============================================================

    const downloadPdfReport = async () => {

        if (!result) {

            alert(
                "Please process the video first."
            );

            return;

        }


        try {

            setPdfLoading(
                true
            );


            setError(
                ""
            );


            // ----------------------------------------------------
            // Prepare report data
            // ----------------------------------------------------

            const reportData = {

                ...result,

                input_type:
                    "Video"

            };


            console.log(
                "Generating video PDF:",
                reportData
            );


            // ----------------------------------------------------
            // Generate PDF
            // ----------------------------------------------------

            const response =
                await API.post(

                    "/generate-pdf",

                    reportData

                );


            console.log(
                "PDF response:",
                response.data
            );


            // ----------------------------------------------------
            // Open generated PDF
            // ----------------------------------------------------

            if (

                response.data?.success &&

                response.data?.pdf_url

            ) {

                const pdfUrl =
                    `http://127.0.0.1:5000${response.data.pdf_url}`;


                window.open(
                    pdfUrl,
                    "_blank"
                );


            } else {

                setError(

                    response.data?.error ||

                    "PDF generation failed."

                );

            }


        } catch (error) {

            console.error(
                "Video PDF generation error:",
                error
            );


            setError(

                error.response?.data?.details ||

                error.response?.data?.error ||

                error.message ||

                "Could not generate PDF report."

            );


        } finally {

            setPdfLoading(
                false
            );

        }

    };


    // ============================================================
    // FORMAT DURATION
    // ============================================================

    const formatDuration = (
        seconds
    ) => {

        const totalSeconds =
            Math.floor(
                seconds || 0
            );


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const remainingSeconds =
            totalSeconds % 60;


        return `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )}`;

    };


    // ============================================================
    // FORMAT CONFIDENCE
    // ============================================================

    const formatConfidence = (
        value
    ) => {

        if (
            typeof value !==
            "number"
        ) {

            return "N/A";

        }


        return (
            (value * 100)
                .toFixed(1)
            + "%"
        );

    };


    // ============================================================
    // SAFE OBJECT DATA
    // ============================================================

    const objects =
        result?.objects &&
        typeof result.objects ===
        "object"

            ? result.objects

            : {};


    // ============================================================
    // DETAILED DESCRIPTION
    // ============================================================

    const detailedDescription =

        result?.detailed_description ||

        result?.description ||

        "The video was analyzed frame by frame using AI object detection.";


    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="container mt-5">


            {/* ==================================================
                TITLE
            ================================================== */}

            <h2 className="mb-4">

                Upload Video

            </h2>


            {/* ==================================================
                UPLOAD CARD
            ================================================== */}

            <div className="card shadow p-4">


                {/* ==================================================
                    VIDEO INPUT
                ================================================== */}

                <input

                    type="file"

                    accept="video/*"

                    className="form-control"

                    onChange={
                        handleVideoChange
                    }

                />


                {/* ==================================================
                    SELECTED VIDEO
                ================================================== */}

                {video && (

                    <p className="mt-2">

                        Selected:{" "}

                        <strong>

                            {video.name}

                        </strong>

                    </p>

                )}


                {/* ==================================================
                    UPLOAD BUTTON
                ================================================== */}

                <button

                    className="btn btn-primary mt-3"

                    onClick={
                        uploadVideo
                    }

                    disabled={
                        uploading
                    }

                >

                    {uploading

                        ? "Processing..."

                        : "Upload & Analyze Video"

                    }

                </button>


                {/* ==================================================
                    PROGRESS
                ================================================== */}

                {progress > 0 && (

                    <div className="progress mt-3">

                        <div

                            className="progress-bar"

                            role="progressbar"

                            style={{

                                width:
                                    `${progress}%`

                            }}

                        >

                            {progress}%

                        </div>

                    </div>

                )}


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="alert alert-danger mt-3">

                        {error}

                    </div>

                )}

            </div>


            {/* ==================================================
                RESULT
            ================================================== */}

            {result &&
                result.success && (

                <div className="card shadow mt-4 p-4">


                    <h3 className="mb-4">

                        Video Analysis Summary

                    </h3>


                    {/* ==================================================
                        DETAILED AI DESCRIPTION
                    ================================================== */}

                    <div className="card shadow-sm mb-4">

                        <div className="card-header">

                            <strong>

                                Detailed AI Description

                            </strong>

                        </div>


                        <div className="card-body">

                            <p className="mb-0">

                                {detailedDescription}

                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        VIDEO INFORMATION
                    ================================================== */}

                    <div className="row">


                        {/* DURATION */}

                        <div className="col-md-3 mb-3">

                            <div className="card p-3">

                                <h6>

                                    Duration

                                </h6>

                                <h4>

                                    {formatDuration(
                                        result.duration
                                    )}

                                </h4>

                            </div>

                        </div>


                        {/* FPS */}

                        <div className="col-md-3 mb-3">

                            <div className="card p-3">

                                <h6>

                                    FPS

                                </h6>

                                <h4>

                                    {
                                        result.fps
                                    }

                                </h4>

                            </div>

                        </div>


                        {/* TOTAL FRAMES */}

                        <div className="col-md-3 mb-3">

                            <div className="card p-3">

                                <h6>

                                    Total Frames

                                </h6>

                                <h4>

                                    {
                                        result.total_frames
                                    }

                                </h4>

                            </div>

                        </div>


                        {/* OBJECT TYPES */}

                        <div className="col-md-3 mb-3">

                            <div className="card p-3">

                                <h6>

                                    Objects

                                </h6>

                                <h4>

                                    {
                                        Object.keys(
                                            objects
                                        ).length
                                    }

                                </h4>

                            </div>

                        </div>

                    </div>


                    {/* ==================================================
                        PROCESSED FRAMES
                    ================================================== */}

                    <div className="alert alert-info mt-3">

                        <strong>

                            Processed Frames:

                        </strong>{" "}

                        {
                            result.processed_frames
                        }

                    </div>


                    {/* ==================================================
                        OBJECT SUMMARY
                    ================================================== */}

                    <h4 className="mt-4">

                        Objects Detected

                    </h4>


                    {Object.keys(
                        objects
                    ).length === 0 ? (

                        <p className="text-muted">

                            No objects detected.

                        </p>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-bordered table-striped">

                                <thead>

                                    <tr>

                                        <th>
                                            Object
                                        </th>

                                        <th>
                                            Detections
                                        </th>

                                        <th>
                                            Average Confidence
                                        </th>

                                        <th>
                                            Highest Confidence
                                        </th>

                                        <th>
                                            Lowest Confidence
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {Object.entries(
                                        objects
                                    ).map(

                                        (
                                            [
                                                name,
                                                data
                                            ]
                                        ) => (

                                            <tr
                                                key={
                                                    name
                                                }
                                            >

                                                <td>

                                                    <strong>

                                                        {
                                                            name
                                                        }

                                                    </strong>

                                                </td>


                                                <td>

                                                    {
                                                        data.detections
                                                    }

                                                </td>


                                                <td>

                                                    {formatConfidence(

                                                        data.average_confidence

                                                    )}

                                                </td>


                                                <td>

                                                    {formatConfidence(

                                                        data.highest_confidence

                                                    )}

                                                </td>


                                                <td>

                                                    {formatConfidence(

                                                        data.lowest_confidence

                                                    )}

                                                </td>

                                            </tr>

                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                    {/* ==================================================
                        PROCESSED VIDEO
                    ================================================== */}

                    {result.video_url && (

                        <div className="mt-4">

                            <h4>

                                Processed Video

                            </h4>


                            <video

                                controls

                                width="100%"

                                className="border rounded"

                            >

                                <source

                                    src={

                                        `http://127.0.0.1:5000${result.video_url}`

                                    }

                                    type="video/mp4"

                                />


                                Your browser does not support
                                video playback.

                            </video>

                        </div>

                    )}


                    {/* ==================================================
                        FRAME DETECTION DETAILS
                    ================================================== */}

                    {result.frame_detections &&

                        result.frame_detections.length > 0 && (

                        <div className="mt-5">

                            <h4>

                                Detection Details

                            </h4>


                            <div

                                className="border rounded p-3"

                                style={{

                                    maxHeight:
                                        "400px",

                                    overflowY:
                                        "auto"

                                }}

                            >

                                {result.frame_detections

                                    .slice(
                                        0,
                                        100
                                    )

                                    .map(

                                        (
                                            frameData
                                        ) => (

                                            <div

                                                key={
                                                    frameData.frame
                                                }

                                                className="border-bottom py-2"

                                            >

                                                <strong>

                                                    Frame{" "}

                                                    {
                                                        frameData.frame
                                                    }

                                                </strong>


                                                {" — "}


                                                Time:{" "}

                                                {
                                                    frameData.time
                                                }s


                                                <br />


                                                {frameData.objects.map(

                                                    (
                                                        object,
                                                        index
                                                    ) => (

                                                        <span

                                                            key={
                                                                index
                                                            }

                                                            className="badge bg-secondary me-2 mt-1"

                                                        >

                                                            {
                                                                object.object
                                                            }

                                                            {" "}

                                                            (

                                                            {formatConfidence(

                                                                object.confidence

                                                            )}

                                                            )

                                                        </span>

                                                    )

                                                )}

                                            </div>

                                        )

                                    )}

                            </div>

                        </div>

                    )}


                    {/* ==================================================
                        PDF REPORT
                    ================================================== */}

                    <div className="card shadow-sm mt-5">

                        <div className="card-body text-center">


                            <h4>

                                Video Analysis Report

                            </h4>


                            <p className="text-muted">

                                Download the complete video
                                analysis, object statistics,
                                confidence values and
                                processing information.

                            </p>


                            <button

                                className="btn btn-danger"

                                onClick={
                                    downloadPdfReport
                                }

                                disabled={
                                    pdfLoading
                                }

                            >

                                {pdfLoading

                                    ? "Generating PDF..."

                                    : "Download PDF Report"

                                }

                            </button>


                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default VideoUpload;