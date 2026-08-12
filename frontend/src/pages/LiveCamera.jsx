import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function LiveCamera() {

    // ========================================================
    // REFERENCES
    // ========================================================

    const videoRef = useRef(null);

    const canvasRef = useRef(null);

    const hiddenCanvasRef = useRef(null);

    const streamRef = useRef(null);

    const detectionIntervalRef =
        useRef(null);

    const processingFrameRef =
        useRef(false);

    const sessionIdRef =
        useRef(null);

    const sessionStartRef =
        useRef(null);

    // Stores every detection from
    // the current camera session.
    const detectionHistoryRef =
        useRef([]);


    // ========================================================
    // STATES
    // ========================================================

    const [cameraOn, setCameraOn] =
        useState(false);

    const [detections, setDetections] =
        useState([]);

    const [sessionSummary, setSessionSummary] =
        useState(null);

    const [error, setError] =
        useState("");

    const [processing, setProcessing] =
        useState(false);

    const [framesAnalyzed, setFramesAnalyzed] =
        useState(0);


    // ========================================================
    // START CAMERA
    // ========================================================

    const startCamera = async () => {

        try {

            // Clear old information
            setError("");

            setDetections([]);

            setSessionSummary(null);

            setFramesAnalyzed(0);


            // Clear previous detection history
            detectionHistoryRef.current = [];


            // Create a new tracking session
            sessionIdRef.current =
                crypto.randomUUID();


            // Save start time
            sessionStartRef.current =
                Date.now();


            // Request camera
            const stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            width: {
                                ideal: 640
                            },

                            height: {
                                ideal: 480
                            }

                        },

                        audio: false

                    });


            streamRef.current =
                stream;


            if (videoRef.current) {

                videoRef.current.srcObject =
                    stream;

            }


            setCameraOn(true);


        } catch (err) {

            console.error(
                "Camera error:",
                err
            );


            setError(
                "Camera permission denied or camera is unavailable."
            );

        }

    };


    // ========================================================
    // STOP CAMERA
    // ========================================================

    const stopCamera = () => {

        // Stop detection interval
        if (
            detectionIntervalRef.current
        ) {

            clearInterval(
                detectionIntervalRef.current
            );

            detectionIntervalRef.current =
                null;

        }


        // Stop camera
        if (streamRef.current) {

            streamRef.current
                .getTracks()
                .forEach(
                    (track) => {

                        track.stop();

                    }
                );


            streamRef.current = null;

        }


        // Remove camera stream
        if (videoRef.current) {

            videoRef.current.srcObject =
                null;

        }


        // Remove bounding boxes
        clearBoundingBoxes();


        // Camera off
        setCameraOn(false);

        setProcessing(false);


        // Create final summary
        createSessionSummary();

    };


    // ========================================================
    // CAPTURE FRAME
    // ========================================================

    const captureFrame = async () => {

        // Don't send another frame while
        // previous request is still processing.
        if (
            processingFrameRef.current
        ) {

            return;

        }


        const video =
            videoRef.current;

        const canvas =
            hiddenCanvasRef.current;


        if (
            !video ||
            !canvas
        ) {

            return;

        }


        // Check video is ready
        if (
            video.readyState < 2
        ) {

            return;

        }


        if (
            video.videoWidth === 0 ||
            video.videoHeight === 0
        ) {

            return;

        }


        try {

            processingFrameRef.current =
                true;

            setProcessing(true);


            // Set canvas dimensions
            canvas.width =
                video.videoWidth;

            canvas.height =
                video.videoHeight;


            const context =
                canvas.getContext("2d");


            // Capture current camera frame
            context.drawImage(

                video,

                0,

                0,

                canvas.width,

                canvas.height

            );


            // Convert frame to JPEG
            const blob =
                await new Promise(
                    (resolve) => {

                        canvas.toBlob(

                            resolve,

                            "image/jpeg",

                            0.7

                        );

                    }
                );


            if (!blob) {

                return;

            }


            // ==================================================
            // SEND FRAME TO FLASK
            // ==================================================

            const formData =
                new FormData();


            formData.append(

                "image",

                blob,

                "live_frame.jpg"

            );


            // IMPORTANT:
            // Send same session ID for every frame.
            formData.append(

                "session_id",

                sessionIdRef.current

            );


            const response =
                await API.post(

                    "/live-detect",

                    formData

                );


            // ==================================================
            // PROCESS RESPONSE
            // ==================================================

            if (
                response.data.success
            ) {

                const currentDetections =
                    response.data.detections ||
                    [];


                // Current live detections
                setDetections(
                    currentDetections
                );


                // Draw bounding boxes
                drawBoundingBoxes(
                    currentDetections
                );


                // ==================================================
                // SAVE DETECTION HISTORY
                // ==================================================

                if (
                    currentDetections.length > 0
                ) {

                    detectionHistoryRef.current.push(

                        ...currentDetections

                    );

                }


                // Frame counter
                setFramesAnalyzed(
                    (previous) =>
                        previous + 1
                );

            }

        } catch (err) {

            console.error(
                "Live detection error:",
                err
            );

        } finally {

            processingFrameRef.current =
                false;

            setProcessing(false);

        }

    };


    // ========================================================
    // START LIVE DETECTION LOOP
    // ========================================================

    useEffect(() => {

        if (!cameraOn) {

            return;

        }


        /*
         * Send one frame every second.
         */

        detectionIntervalRef.current =
            setInterval(() => {

                captureFrame();

            }, 1000);


        return () => {

            if (
                detectionIntervalRef.current
            ) {

                clearInterval(
                    detectionIntervalRef.current
                );

                detectionIntervalRef.current =
                    null;

            }

        };

    }, [cameraOn]);


    // ========================================================
    // DRAW BOUNDING BOXES
    // ========================================================

    const drawBoundingBoxes = (
        items
    ) => {

        const video =
            videoRef.current;

        const canvas =
            canvasRef.current;


        if (
            !video ||
            !canvas
        ) {

            return;

        }


        if (
            video.videoWidth === 0 ||
            video.videoHeight === 0
        ) {

            return;

        }


        // Match canvas to camera resolution
        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;


        const context =
            canvas.getContext("2d");


        context.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );


        context.lineWidth = 3;

        context.font =
            "16px Arial";


        items.forEach(
            (item) => {

                const x1 =
                    item.x1;

                const y1 =
                    item.y1;

                const x2 =
                    item.x2;

                const y2 =
                    item.y2;


                const width =
                    x2 - x1;

                const height =
                    y2 - y1;


                // Bounding box
                context.strokeStyle =
                    "#00ff00";


                context.strokeRect(

                    x1,

                    y1,

                    width,

                    height

                );


                // Confidence
                const confidence =
                    (
                        item.confidence * 100
                    ).toFixed(1);


                // Tracking ID
                const trackId =
                    item.track_id !== null
                        ? `#${item.track_id}`
                        : "#?";


                const label =
                    `${item.object} ${trackId} ${confidence}%`;


                // Label width
                const textWidth =
                    context.measureText(
                        label
                    ).width;


                // Label background
                context.fillStyle =
                    "#00ff00";


                context.fillRect(

                    x1,

                    Math.max(
                        0,
                        y1 - 25
                    ),

                    textWidth + 12,

                    25

                );


                // Label text
                context.fillStyle =
                    "#000000";


                context.fillText(

                    label,

                    x1 + 6,

                    Math.max(
                        17,
                        y1 - 8
                    )

                );

            }
        );

    };


    // ========================================================
    // CLEAR BOUNDING BOXES
    // ========================================================

    const clearBoundingBoxes = () => {

        const canvas =
            canvasRef.current;


        if (!canvas) {

            return;

        }


        const context =
            canvas.getContext("2d");


        context.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

    };


    // ========================================================
    // CREATE TRACKING SUMMARY
    // ========================================================

    const createSessionSummary = () => {

        const history =
            detectionHistoryRef.current;


        // Calculate duration
        let duration = 0;


        if (
            sessionStartRef.current
        ) {

            duration =
                (
                    Date.now() -
                    sessionStartRef.current
                ) / 1000;

        }


        // ====================================================
        // NO DETECTIONS
        // ====================================================

        if (
            history.length === 0
        ) {

            setSessionSummary({

                duration,

                totalDetections: 0,

                uniqueTracks: 0,

                objectTypes: 0,

                mostDetected: "None",

                mostDetectedCount: 0,

                objects: {}

            });

            return;

        }


        // ====================================================
        // TRACK DATA
        // ====================================================

        const trackData = {};


        history.forEach(
            (item) => {

                /*
                 * A tracking ID should normally be
                 * available from ByteTrack.
                 *
                 * If it is not available,
                 * use object name as fallback.
                 */

                const trackId =
                    item.track_id !== null &&
                    item.track_id !== undefined
                        ? item.track_id
                        : `unknown-${item.object}`;


                const key =
                    `${item.object}-${trackId}`;


                if (
                    !trackData[key]
                ) {

                    trackData[key] = {

                        object:
                            item.object,

                        trackId:
                            item.track_id,

                        framesSeen:
                            0,

                        confidenceTotal:
                            0,

                        highestConfidence:
                            0,

                        lowestConfidence:
                            1

                    };

                }


                // Number of frames
                trackData[key]
                    .framesSeen += 1;


                // Confidence
                trackData[key]
                    .confidenceTotal +=
                    item.confidence;


                // Highest
                if (
                    item.confidence >
                    trackData[key]
                        .highestConfidence
                ) {

                    trackData[key]
                        .highestConfidence =
                        item.confidence;

                }


                // Lowest
                if (
                    item.confidence <
                    trackData[key]
                        .lowestConfidence
                ) {

                    trackData[key]
                        .lowestConfidence =
                        item.confidence;

                }

            }
        );


        // ====================================================
        // GROUP TRACKS BY OBJECT
        // ====================================================

        const objects = {};


        Object.values(
            trackData
        ).forEach(
            (track) => {

                const name =
                    track.object;


                if (
                    !objects[name]
                ) {

                    objects[name] = {

                        uniqueTracks: 0,

                        totalFrames: 0,

                        confidenceTotal: 0,

                        highestConfidence: 0,

                        lowestConfidence: 1,

                        tracks: []

                    };

                }


                objects[name]
                    .uniqueTracks += 1;


                objects[name]
                    .totalFrames +=
                    track.framesSeen;


                objects[name]
                    .confidenceTotal +=
                    track.confidenceTotal;


                if (
                    track.highestConfidence >
                    objects[name]
                        .highestConfidence
                ) {

                    objects[name]
                        .highestConfidence =
                        track.highestConfidence;

                }


                if (
                    track.lowestConfidence <
                    objects[name]
                        .lowestConfidence
                ) {

                    objects[name]
                        .lowestConfidence =
                        track.lowestConfidence;

                }


                objects[name]
                    .tracks
                    .push({

                        id:
                            track.trackId,

                        framesSeen:
                            track.framesSeen,

                        averageConfidence:
                            track.confidenceTotal /
                            track.framesSeen,

                        highestConfidence:
                            track.highestConfidence,

                        lowestConfidence:
                            track.lowestConfidence

                    });

            }
        );


        // ====================================================
        // CALCULATE OBJECT AVERAGE
        // ====================================================

        Object.keys(
            objects
        ).forEach(
            (name) => {

                const data =
                    objects[name];


                data.averageConfidence =
                    data.confidenceTotal /
                    data.totalFrames;

            }
        );


        // ====================================================
        // MOST DETECTED OBJECT TYPE
        // ====================================================

        let mostDetected =
            null;

        let mostDetectedCount =
            0;


        Object.entries(
            objects
        ).forEach(
            ([name, data]) => {

                if (
                    data.totalFrames >
                    mostDetectedCount
                ) {

                    mostDetected =
                        name;

                    mostDetectedCount =
                        data.totalFrames;

                }

            }
        );


        // ====================================================
        // FINAL SUMMARY
        // ====================================================

        setSessionSummary({

            duration,

            totalDetections:
                history.length,

            uniqueTracks:
                Object.keys(
                    trackData
                ).length,

            objectTypes:
                Object.keys(
                    objects
                ).length,

            mostDetected,

            mostDetectedCount,

            objects

        });

    };


    // ========================================================
    // FORMAT TIME
    // ========================================================

    const formatDuration = (
        seconds
    ) => {

        const totalSeconds =
            Math.floor(seconds);


        const minutes =
            Math.floor(
                totalSeconds / 60
            );


        const remainingSeconds =
            totalSeconds % 60;


        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(
            2,
            "0"
        )}`;

    };


    // ========================================================
    // CLEANUP
    // ========================================================

    useEffect(() => {

        return () => {

            if (
                detectionIntervalRef.current
            ) {

                clearInterval(
                    detectionIntervalRef.current
                );

            }


            if (streamRef.current) {

                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) => {

                            track.stop();

                        }
                    );

            }

        };

    }, []);


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="container mt-4">


            {/* ==================================================
                CAMERA CARD
            ================================================== */}

            <div className="card shadow p-4">


                <h2 className="text-center mb-4">

                    Live Camera Capture

                </h2>


                <div className="row">


                    {/* ==========================================
                        CAMERA
                    ========================================== */}

                    <div className="col-md-8">

                        <div
                            style={{
                                position:
                                    "relative",

                                width:
                                    "100%",

                                maxWidth:
                                    "700px",

                                margin:
                                    "auto"
                            }}
                        >


                            {/* VIDEO */}

                            <video

                                ref={
                                    videoRef
                                }

                                autoPlay

                                playsInline

                                muted

                                className="border rounded"

                                style={{

                                    width:
                                        "100%",

                                    minHeight:
                                        "300px",

                                    display:
                                        "block",

                                    backgroundColor:
                                        "#f8f9fa"

                                }}

                            />


                            {/* BOUNDING BOX CANVAS */}

                            <canvas

                                ref={
                                    canvasRef
                                }

                                style={{

                                    position:
                                        "absolute",

                                    top: 0,

                                    left: 0,

                                    width:
                                        "100%",

                                    height:
                                        "100%",

                                    pointerEvents:
                                        "none"

                                }}

                            />


                            {/* HIDDEN CANVAS */}

                            <canvas

                                ref={
                                    hiddenCanvasRef
                                }

                                style={{
                                    display:
                                        "none"
                                }}

                            />

                        </div>


                        {/* ======================================
                            BUTTON
                        ====================================== */}

                        <div className="text-center mt-4">

                            {!cameraOn ? (

                                <button

                                    className="btn btn-success"

                                    onClick={
                                        startCamera
                                    }

                                >

                                    Start Camera

                                </button>

                            ) : (

                                <button

                                    className="btn btn-danger"

                                    onClick={
                                        stopCamera
                                    }

                                >

                                    Stop Camera

                                </button>

                            )}

                        </div>


                        {/* ======================================
                            STATUS
                        ====================================== */}

                        <div className="text-center mt-3">

                            {cameraOn && (

                                <p className="text-success">

                                    ● Camera is running

                                </p>

                            )}


                            {processing && (

                                <p className="text-primary">

                                    AI is analyzing...

                                </p>

                            )}


                            {cameraOn && (

                                <p className="text-muted">

                                    Frames analyzed:{" "}

                                    {framesAnalyzed}

                                </p>

                            )}


                            {error && (

                                <div className="alert alert-danger">

                                    {error}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        LIVE DETECTION
                    ========================================== */}

                    <div className="col-md-4">


                        <div className="card">


                            <div className="card-header">

                                <h5 className="mb-0">

                                    Live Detection

                                </h5>

                            </div>


                            <div className="card-body">


                                {detections.length === 0 ? (

                                    <p className="text-muted">

                                        No objects detected

                                    </p>

                                ) : (

                                    detections.map(

                                        (
                                            item,
                                            index
                                        ) => (

                                            <div

                                                key={`${item.object}-${item.track_id}-${index}`}

                                                className="alert alert-info py-2 mb-2"

                                            >

                                                <strong>

                                                    {item.object}

                                                </strong>


                                                {item.track_id !==
                                                    null && (

                                                    <>

                                                        <br />

                                                        Tracking ID:{" "}

                                                        <strong>

                                                            #
                                                            {
                                                                item.track_id
                                                            }

                                                        </strong>

                                                    </>

                                                )}


                                                <br />

                                                Confidence:{" "}

                                                {(
                                                    item.confidence *
                                                    100
                                                ).toFixed(1)}

                                                %

                                            </div>

                                        )

                                    )

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                SESSION SUMMARY
            ================================================== */}

            {sessionSummary && (

                <div className="card shadow mt-5 p-4">


                    <h2 className="text-center mb-3">

                        Live Session Summary

                    </h2>


                    <p className="text-center text-muted">

                        Summary of everything detected
                        and tracked while the camera
                        was running.

                    </p>


                    <hr />


                    {/* ==========================================
                        SUMMARY CARDS
                    ========================================== */}

                    <div className="row mt-4">


                        {/* Duration */}

                        <div className="col-md-3 mb-3">

                            <div className="card shadow-sm p-3 text-center">

                                <h6 className="text-muted">

                                    Duration

                                </h6>

                                <h3>

                                    {formatDuration(
                                        sessionSummary.duration
                                    )}

                                </h3>

                            </div>

                        </div>


                        {/* Frames */}

                        <div className="col-md-3 mb-3">

                            <div className="card shadow-sm p-3 text-center">

                                <h6 className="text-muted">

                                    Frames Analyzed

                                </h6>

                                <h3>

                                    {framesAnalyzed}

                                </h3>

                            </div>

                        </div>


                        {/* Unique tracks */}

                        <div className="col-md-3 mb-3">

                            <div className="card shadow-sm p-3 text-center">

                                <h6 className="text-muted">

                                    Unique Tracks

                                </h6>

                                <h3>

                                    {
                                        sessionSummary
                                            .uniqueTracks
                                    }

                                </h3>

                            </div>

                        </div>


                        {/* Object types */}

                        <div className="col-md-3 mb-3">

                            <div className="card shadow-sm p-3 text-center">

                                <h6 className="text-muted">

                                    Object Types

                                </h6>

                                <h3>

                                    {
                                        sessionSummary
                                            .objectTypes
                                    }

                                </h3>

                            </div>

                        </div>

                    </div>


                    {/* ==========================================
                        MOST DETECTED
                    ========================================== */}

                    {sessionSummary.mostDetected && (

                        <div className="alert alert-success mt-3">

                            <strong>

                                Most Observed Object:

                            </strong>

                            {" "}

                            {
                                sessionSummary
                                    .mostDetected
                            }

                            {" "}

                            — seen in{" "}

                            {
                                sessionSummary
                                    .mostDetectedCount
                            }

                            analyzed frames.

                        </div>

                    )}


                    {/* ==========================================
                        TRACKING SUMMARY TABLE
                    ========================================== */}

                    <h4 className="mt-4">

                        Object Tracking Summary

                    </h4>


                    <div className="table-responsive mt-3">

                        <table className="table table-bordered table-striped">

                            <thead>

                                <tr>

                                    <th>
                                        Object
                                    </th>

                                    <th>
                                        Unique Tracks
                                    </th>

                                    <th>
                                        Frames Seen
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
                                    sessionSummary.objects
                                ).map(

                                    (
                                        [
                                            name,
                                            data
                                        ]
                                    ) => (

                                        <tr key={name}>

                                            <td>

                                                <strong>

                                                    {name}

                                                </strong>

                                            </td>


                                            <td>

                                                {
                                                    data.uniqueTracks
                                                }

                                            </td>


                                            <td>

                                                {
                                                    data.totalFrames
                                                }

                                            </td>


                                            <td>

                                                {(
                                                    data.averageConfidence *
                                                    100
                                                ).toFixed(1)}

                                                %

                                            </td>


                                            <td>

                                                {(
                                                    data.highestConfidence *
                                                    100
                                                ).toFixed(1)}

                                                %

                                            </td>


                                            <td>

                                                {(
                                                    data.lowestConfidence *
                                                    100
                                                ).toFixed(1)}

                                                %

                                            </td>

                                        </tr>

                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ==========================================
                        TRACK DETAILS
                    ========================================== */}

                    <h4 className="mt-5">

                        Tracking Details

                    </h4>


                    <div className="row mt-3">


                        {Object.entries(
                            sessionSummary.objects
                        ).map(

                            (
                                [
                                    name,
                                    data
                                ]
                            ) => (

                                <div
                                    className="col-md-4 mb-4"
                                    key={name}
                                >

                                    <div className="card h-100 shadow-sm">

                                        <div className="card-body">


                                            <h5>

                                                {name}

                                            </h5>


                                            <hr />


                                            <p>

                                                <strong>

                                                    Unique Tracks:

                                                </strong>{" "}

                                                {
                                                    data.uniqueTracks
                                                }

                                            </p>


                                            {data.tracks.map(

                                                (
                                                    track,
                                                    index
                                                ) => (

                                                    <div
                                                        key={`${name}-${track.id}-${index}`}
                                                        className="border rounded p-2 mb-2"
                                                    >

                                                        <strong>

                                                            Tracking ID:{" "}

                                                            {track.id !==
                                                                null
                                                                ? `#${track.id}`
                                                                : "Unknown"}

                                                        </strong>


                                                        <br />


                                                        Frames Seen:{" "}

                                                        {
                                                            track.framesSeen
                                                        }


                                                        <br />


                                                        Average Confidence:{" "}

                                                        {(
                                                            track.averageConfidence *
                                                            100
                                                        ).toFixed(1)}

                                                        %


                                                        <br />


                                                        Highest:{" "}

                                                        {(
                                                            track.highestConfidence *
                                                            100
                                                        ).toFixed(1)}

                                                        %


                                                    </div>

                                                )

                                            )}

                                        </div>

                                    </div>

                                </div>

                            )

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}

export default LiveCamera;