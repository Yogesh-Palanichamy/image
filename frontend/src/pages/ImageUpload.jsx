import { useState } from "react";
import API from "../services/api";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";


function ImageUpload() {

    // ============================================================
    // STATE
    // ============================================================

    const [image, setImage] =
        useState(null);

    const [preview, setPreview] =
        useState("");

    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [pdfLoading, setPdfLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ============================================================
    // SELECT IMAGE
    // ============================================================

    const selectImage = (event) => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        setImage(file);


        setPreview(
            URL.createObjectURL(file)
        );


        setResult(null);

        setError("");

    };


    // ============================================================
    // ANALYZE IMAGE
    // ============================================================

    const uploadImage = async () => {

        if (!image) {

            alert(
                "Please select an image."
            );

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "image",
            image
        );


        try {

            setLoading(true);

            setError("");

            setResult(null);


            const response =
                await API.post(

                    "/analyze-image",

                    formData,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }

                );


            console.log(
                "Image Analysis Result:",
                response.data
            );


            setResult(
                response.data
            );


        } catch (err) {

            console.error(
                "Image Analysis Error:",
                err
            );


            if (err.response) {

                console.log(
                    "Server Response:",
                    err.response.data
                );


                setError(

                    err.response.data?.details ||

                    err.response.data?.error ||

                    `Server Error: ${err.response.status}`

                );


            } else if (err.request) {

                setError(
                    "No response from Flask server."
                );


            } else {

                setError(
                    err.message
                );

            }


        } finally {

            setLoading(false);

        }

    };


    // ============================================================
    // DOWNLOAD PDF REPORT
    // ============================================================

    const downloadPdfReport = async () => {

        if (!result) {

            alert(
                "Please analyze an image first."
            );

            return;

        }


        try {

            setPdfLoading(true);

            setError("");


            const reportData = {

                ...result,

                input_type: "Image"

            };


            console.log(
                "Generating PDF:",
                reportData
            );


            const response =
                await API.post(

                    "/generate-pdf",

                    reportData

                );


            console.log(
                "PDF response:",
                response.data
            );


            if (
                response.data?.success &&
                response.data?.pdf_url
            ) {

                const pdfUrl =
                    `http://127.0.0.1:5000${response.data.pdf_url}`;


                window.open(
                    pdfUrl,
                    "_blank",
                    "noopener,noreferrer"
                );


            } else {

                setError(

                    response.data?.error ||

                    "PDF generation failed."

                );

            }


        } catch (err) {

            console.error(
                "PDF generation error:",
                err
            );


            setError(

                err.response?.data?.details ||

                err.response?.data?.error ||

                err.message ||

                "Could not generate PDF report."

            );


        } finally {

            setPdfLoading(false);

        }

    };


    // ============================================================
    // SAFE RESULT DATA
    // ============================================================

    const objects =
        Array.isArray(
            result?.objects
        )
            ? result.objects
            : [];


    const objectCounts =
        result?.object_counts &&
        typeof result.object_counts === "object"

            ? result.object_counts

            : {};


    const ocrText =
        Array.isArray(
            result?.text
        )
            ? result.text
            : [];


    const faces =
        Array.isArray(
            result?.faces
        )
            ? result.faces
            : [];


    // ============================================================
    // CHART DATA
    // ============================================================

    const chartData =
        objects.map(
            (obj, index) => ({

                name:
                    `${obj.name || "Object"} ${index + 1}`,

                confidence:
                    typeof obj.confidence === "number"

                        ? Number(
                            (
                                obj.confidence * 100
                            ).toFixed(2)
                        )

                        : 0,

            })
        );


    // ============================================================
    // FORMAT CONFIDENCE
    // ============================================================

    const formatConfidence = (value) => {

        if (
            typeof value !== "number"
        ) {

            return "N/A";

        }


        return `${(
            value * 100
        ).toFixed(2)}%`;

    };


    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="container mt-5 mb-5">


            {/* ================================================== */}
            {/* TITLE */}
            {/* ================================================== */}

            <div className="text-center mb-4">

                <h2>

                    AI Image Processor

                </h2>


                <p className="text-muted">

                    Upload an image and analyze it
                    using AI.

                </p>

            </div>


            {/* ================================================== */}
            {/* IMAGE SELECT */}
            {/* ================================================== */}

            <div className="card shadow">

                <div className="card-header">

                    <h5 className="mb-0">

                        Select Image

                    </h5>

                </div>


                <div className="card-body">

                    <input

                        type="file"

                        className="form-control"

                        accept="image/*"

                        onChange={
                            selectImage
                        }

                    />


                    {image && (

                        <div className="mt-3">

                            <strong>
                                Selected:
                            </strong>


                            <span className="ms-2">

                                {image.name}

                            </span>

                        </div>

                    )}

                </div>

            </div>


            {/* ================================================== */}
            {/* IMAGE PREVIEW */}
            {/* ================================================== */}

            {preview && (

                <div className="card mt-4 shadow">

                    <div className="card-header">

                        <h5 className="mb-0">

                            Uploaded Image

                        </h5>

                    </div>


                    <div className="card-body text-center">

                        <img

                            src={preview}

                            alt="Uploaded Preview"

                            className="img-fluid rounded"

                            style={{
                                maxHeight: "500px"
                            }}

                        />

                    </div>

                </div>

            )}


            {/* ================================================== */}
            {/* ANALYZE BUTTON */}
            {/* ================================================== */}

            <div className="text-center">

                <button

                    className="btn btn-success mt-4"

                    onClick={
                        uploadImage
                    }

                    disabled={
                        loading || !image
                    }

                >

                    {loading
                        ? "Analyzing..."
                        : "Analyze Image"}

                </button>

            </div>


            {/* ================================================== */}
            {/* LOADING */}
            {/* ================================================== */}

            {loading && (

                <div className="text-center mt-4">

                    <div

                        className="spinner-border text-success"

                        role="status"

                    >

                    </div>


                    <p className="text-muted mt-2">

                        AI models are analyzing
                        your image...

                    </p>

                </div>

            )}


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (

                <div className="alert alert-danger mt-4">

                    <strong>
                        Error:
                    </strong>


                    <div className="mt-2">

                        {error}

                    </div>

                </div>

            )}


            {/* ================================================== */}
            {/* RESULTS */}
            {/* ================================================== */}

            {result && (

                <div className="mt-5">


                    <h3 className="mb-4">

                        Analysis Result

                    </h3>


                    {/* ==========================================
                        DETAILED AI DESCRIPTION
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Detailed AI Description

                            </strong>

                        </div>


                        <div className="card-body">

                            <p className="mb-0">

                                {result.detailed_description ||

                                    result.description ||

                                    result.caption ||

                                    "No detailed description generated."

                                }

                            </p>

                        </div>

                    </div>


                    {/* ==========================================
                        IMAGE CAPTION
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Image Caption

                            </strong>

                        </div>


                        <div className="card-body">

                            <p className="mb-0">

                                {result.caption ||

                                    "No Caption Generated"}

                            </p>

                        </div>

                    </div>


                    {/* ==========================================
                        DETECTED OBJECTS
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Detected Objects

                            </strong>

                        </div>


                        <div className="card-body">

                            {objects.length === 0 ? (

                                <div className="alert alert-warning mb-0">

                                    No Objects Detected

                                </div>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-bordered table-striped">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Object
                                                </th>

                                                <th>
                                                    Confidence
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {objects.map(

                                                (
                                                    obj,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            index
                                                        }
                                                    >

                                                        <td>

                                                            {
                                                                obj.name
                                                            }

                                                        </td>


                                                        <td>

                                                            {formatConfidence(
                                                                obj.confidence
                                                            )}

                                                        </td>

                                                    </tr>

                                                )

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        OBJECT COUNT
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Object Count

                            </strong>

                        </div>


                        <div className="card-body">

                            {Object.keys(
                                objectCounts
                            ).length === 0 ? (

                                <p className="mb-0">

                                    No Object Count
                                    Available

                                </p>

                            ) : (

                                <div className="table-responsive">

                                    <table className="table table-bordered">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Object
                                                </th>

                                                <th>
                                                    Count
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {Object.entries(

                                                objectCounts

                                            ).map(

                                                (
                                                    [
                                                        name,
                                                        count
                                                    ]
                                                ) => (

                                                    <tr
                                                        key={
                                                            name
                                                        }
                                                    >

                                                        <td>
                                                            {name}
                                                        </td>

                                                        <td>
                                                            {count}
                                                        </td>

                                                    </tr>

                                                )

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        CONFIDENCE CHART
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Confidence Chart

                            </strong>

                        </div>


                        <div

                            className="card-body"

                            style={{
                                height: "350px"
                            }}

                        >

                            {chartData.length === 0 ? (

                                <div className="text-center text-muted mt-5">

                                    No confidence data
                                    available.

                                </div>

                            ) : (

                                <ResponsiveContainer

                                    width="100%"

                                    height="100%"

                                >

                                    <BarChart
                                        data={
                                            chartData
                                        }
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />


                                        <XAxis
                                            dataKey="name"
                                        />


                                        <YAxis
                                            domain={[
                                                0,
                                                100
                                            ]}
                                        />


                                        <Tooltip />


                                        <Bar
                                            dataKey="confidence"
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        OCR
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                OCR Text

                            </strong>

                        </div>


                        <div className="card-body">

                            {ocrText.length === 0 ? (

                                <div className="alert alert-warning mb-0">

                                    No Text Found

                                </div>

                            ) : (

                                <div>

                                    {ocrText.map(

                                        (
                                            item,
                                            index
                                        ) => {

                                            if (
                                                typeof item ===
                                                "object"
                                            ) {

                                                return (

                                                    <div

                                                        className="border rounded p-3 mb-2"

                                                        key={
                                                            index
                                                        }

                                                    >

                                                        <div>

                                                            <strong>

                                                                Text:

                                                            </strong>


                                                            <span className="ms-2">

                                                                {
                                                                    item.text
                                                                }

                                                            </span>

                                                        </div>


                                                        <div className="text-muted mt-1">

                                                            Confidence:

                                                            <span className="ms-2">

                                                                {typeof item.confidence ===
                                                                "number"

                                                                    ? `${(
                                                                        item.confidence *
                                                                        100
                                                                    ).toFixed(2)}%`

                                                                    : "N/A"}

                                                            </span>

                                                        </div>

                                                    </div>

                                                );

                                            }


                                            return (

                                                <div

                                                    className="border rounded p-2 mb-2"

                                                    key={
                                                        index
                                                    }

                                                >

                                                    {String(
                                                        item
                                                    )}

                                                </div>

                                            );

                                        }

                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        FACE DETECTION
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Face Detection

                            </strong>

                        </div>


                        <div className="card-body text-center">

                            <h1>

                                {faces.length}

                            </h1>


                            <h5>

                                Face(s) Detected

                            </h5>


                            {faces.length > 0 && (

                                <div className="table-responsive mt-4">

                                    <table className="table table-bordered">

                                        <thead>

                                            <tr>

                                                <th>
                                                    Face
                                                </th>

                                                <th>
                                                    X
                                                </th>

                                                <th>
                                                    Y
                                                </th>

                                                <th>
                                                    Width
                                                </th>

                                                <th>
                                                    Height
                                                </th>

                                                <th>
                                                    Confidence
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {faces.map(

                                                (
                                                    face,
                                                    index
                                                ) => (

                                                    <tr
                                                        key={
                                                            index
                                                        }
                                                    >

                                                        <td>

                                                            Face{" "}
                                                            {index + 1}

                                                        </td>


                                                        <td>

                                                            {
                                                                face.xmin
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                face.ymin
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                face.width
                                                            }

                                                        </td>


                                                        <td>

                                                            {
                                                                face.height
                                                            }

                                                        </td>


                                                        <td>

                                                            {typeof face.confidence ===
                                                            "number"

                                                                ? `${(
                                                                    face.confidence *
                                                                    100
                                                                ).toFixed(2)}%`

                                                                : "N/A"}

                                                        </td>

                                                    </tr>

                                                )

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        PDF REPORT
                    ========================================== */}

                    <div className="card mb-4 shadow">

                        <div className="card-header">

                            <strong>

                                Analysis Report

                            </strong>

                        </div>


                        <div className="card-body text-center">

                            <p className="text-muted">

                                Download all available
                                image-analysis results
                                as a PDF report.

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


                    {/* ==========================================
                        SUCCESS
                    ========================================== */}

                    <div className="alert alert-success">

                        <strong>

                            Analysis Completed Successfully!

                        </strong>


                        <div className="mt-1">

                            YOLO, image captioning,
                            OCR and face detection
                            results have been processed.

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default ImageUpload;