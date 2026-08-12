import os
import uuid

import cv2
import numpy as np

from collections import Counter

from flask import (
    Flask,
    request,
    jsonify,
    send_from_directory
)

from flask_cors import CORS

from werkzeug.utils import secure_filename

from ultralytics import YOLO

from services.analysis_service import analyze_image

from services.video_service import process_video


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# FOLDERS
# ============================================================

IMAGE_FOLDER = "uploads/images"

VIDEO_FOLDER = "uploads/videos"

OUTPUT_FOLDER = "outputs"

PROCESSED_FOLDER = "outputs/processed"


os.makedirs(
    IMAGE_FOLDER,
    exist_ok=True
)

os.makedirs(
    VIDEO_FOLDER,
    exist_ok=True
)

os.makedirs(
    OUTPUT_FOLDER,
    exist_ok=True
)

os.makedirs(
    PROCESSED_FOLDER,
    exist_ok=True
)


# ============================================================
# CONFIG
# ============================================================

app.config[
    "IMAGE_FOLDER"
] = IMAGE_FOLDER

app.config[
    "VIDEO_FOLDER"
] = VIDEO_FOLDER

app.config[
    "PROCESSED_FOLDER"
] = PROCESSED_FOLDER


# ============================================================
# YOLO MODEL
# ============================================================

MODEL_PATH = "models/yolov8n.pt"

tracking_model = YOLO(
    MODEL_PATH
)


# ============================================================
# LIVE SESSION
# ============================================================

current_session_id = None


live_object_counter = Counter()

live_confidence_values = {}

live_frame_count = 0

live_detection_history = []


# ============================================================
# HOME
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "message":
            "AI Image Processor API Running"

    })


# ============================================================
# IMAGE ANALYSIS
# ============================================================

@app.route(
    "/analyze-image",
    methods=["POST"]
)
def analyze():

    if "image" not in request.files:

        return jsonify({

            "error":
                "No image uploaded"

        }), 400

    file = request.files[
        "image"
    ]

    if file.filename == "":

        return jsonify({

            "error":
                "No file selected"

        }), 400

    filename = secure_filename(
        file.filename
    )

    filepath = os.path.join(

        app.config[
            "IMAGE_FOLDER"
        ],

        filename

    )

    file.save(filepath)

    try:

        result = analyze_image(
            filepath
        )

        return jsonify(
            result
        )

    except Exception as error:

        print(
            "Image analysis error:",
            error
        )

        return jsonify({

            "error":
                "Image analysis failed",

            "details":
                str(error)

        }), 500


# ============================================================
# LIVE DETECTION
# ============================================================

@app.route(
    "/live-detect",
    methods=["POST"]
)
def live_detect():

    global current_session_id

    global live_object_counter

    global live_confidence_values

    global live_frame_count

    global live_detection_history


    # ========================================================
    # CHECK IMAGE
    # ========================================================

    if "image" not in request.files:

        return jsonify({

            "success":
                False,

            "error":
                "No image received"

        }), 400


    file = request.files[
        "image"
    ]


    if file.filename == "":

        return jsonify({

            "success":
                False,

            "error":
                "Empty image"

        }), 400


    # ========================================================
    # SESSION
    # ========================================================

    session_id = request.form.get(
        "session_id"
    )


    if not session_id:

        session_id = str(
            uuid.uuid4()
        )


    # ========================================================
    # NEW SESSION
    # ========================================================

    if current_session_id != session_id:

        print()
        print(
            "===================================="
        )
        print(
            "NEW LIVE SESSION"
        )
        print(
            "Session:",
            session_id
        )
        print(
            "===================================="
        )


        current_session_id = (
            session_id
        )

        live_object_counter = Counter()

        live_confidence_values = {}

        live_frame_count = 0

        live_detection_history = []


    # ========================================================
    # READ IMAGE
    # ========================================================

    try:

        image_bytes = file.read()

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8
        )

        frame = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR
        )

    except Exception as error:

        return jsonify({

            "success":
                False,

            "error":
                "Could not decode image",

            "details":
                str(error)

        }), 400


    if frame is None:

        return jsonify({

            "success":
                False,

            "error":
                "Could not read image"

        }), 400


    # ========================================================
    # YOLO TRACKING
    # ========================================================

    try:

        results = tracking_model.track(

            frame,

            persist=True,

            tracker="bytetrack.yaml",

            verbose=False

        )

    except Exception as error:

        print(
            "YOLO tracking error:",
            error
        )

        return jsonify({

            "success":
                False,

            "error":
                "YOLO tracking failed",

            "details":
                str(error)

        }), 500


    result = results[0]

    detections = []


    # ========================================================
    # FRAME COUNT
    # ========================================================

    live_frame_count += 1


    # ========================================================
    # DETECTIONS
    # ========================================================

    if result.boxes is not None:

        boxes = result.boxes

        for index in range(
            len(boxes)
        ):

            class_id = int(
                boxes.cls[index].item()
            )

            object_name = (
                tracking_model.names[
                    class_id
                ]
            )

            confidence = float(
                boxes.conf[index].item()
            )


            # ------------------------------------------------
            # COUNT
            # ------------------------------------------------

            live_object_counter[
                object_name
            ] += 1


            # ------------------------------------------------
            # CONFIDENCE
            # ------------------------------------------------

            if object_name not in live_confidence_values:

                live_confidence_values[
                    object_name
                ] = []


            live_confidence_values[
                object_name
            ].append(
                confidence
            )


            # ------------------------------------------------
            # BOX
            # ------------------------------------------------

            coordinates = boxes.xyxy[
                index
            ].tolist()

            x1, y1, x2, y2 = coordinates


            # ------------------------------------------------
            # TRACK ID
            # ------------------------------------------------

            track_id = None

            if boxes.id is not None:

                track_id = int(
                    boxes.id[index].item()
                )


            # ------------------------------------------------
            # DETECTION
            # ------------------------------------------------

            detections.append({

                "object":
                    object_name,

                "confidence":
                    round(
                        confidence,
                        4
                    ),

                "track_id":
                    track_id,

                "x1":
                    int(x1),

                "y1":
                    int(y1),

                "x2":
                    int(x2),

                "y2":
                    int(y2)

            })


    # ========================================================
    # SAVE HISTORY
    # ========================================================

    if detections:

        live_detection_history.append({

            "frame":
                live_frame_count,

            "objects":
                detections

        })


    # ========================================================
    # LIVE RESPONSE
    # ========================================================

    return jsonify({

        "success":
            True,

        "session_id":
            session_id,

        "frame":
            live_frame_count,

        "detections":
            detections

    })


# ============================================================
# LIVE SUMMARY
# ============================================================

@app.route(
    "/live-summary",
    methods=["POST"]
)
def live_summary():

    global current_session_id


    session_id = request.form.get(
        "session_id"
    )


    # ========================================================
    # CONFIDENCE SUMMARY
    # ========================================================

    objects = {}


    for object_name, count in (
        live_object_counter.items()
    ):

        values = (
            live_confidence_values.get(
                object_name,
                []
            )
        )


        objects[
            object_name
        ] = {

            "detections":
                count,

            "average_confidence":
                round(
                    sum(values) /
                    len(values),
                    4
                ) if values else 0,

            "highest_confidence":
                round(
                    max(values),
                    4
                ) if values else 0,

            "lowest_confidence":
                round(
                    min(values),
                    4
                ) if values else 0

        }


    # ========================================================
    # SUMMARY
    # ========================================================

    summary = {

        "success":
            True,

        "session_id":
            session_id,

        "total_frames":
            live_frame_count,

        "objects":
            objects,

        "frame_detections":
            live_detection_history

    }


    print()
    print(
        "===================================="
    )
    print(
        "LIVE SESSION SUMMARY"
    )
    print(
        "Frames:",
        live_frame_count
    )
    print(
        "Objects:",
        dict(live_object_counter)
    )
    print(
        "===================================="
    )


    # ========================================================
    # RESET SESSION
    # ========================================================

    current_session_id = None


    return jsonify(
        summary
    )


# ============================================================
# VIDEO UPLOAD
# ============================================================

@app.route(
    "/upload/video",
    methods=["POST"]
)
def upload_video():

    print()
    print(
        "===================================="
    )
    print(
        "VIDEO UPLOAD"
    )


    # ========================================================
    # CHECK FILE
    # ========================================================

    if "video" not in request.files:

        return jsonify({

            "success":
                False,

            "error":
                "No video uploaded"

        }), 400


    file = request.files[
        "video"
    ]


    if file.filename == "":

        return jsonify({

            "success":
                False,

            "error":
                "No video selected"

        }), 400


    # ========================================================
    # SAVE VIDEO
    # ========================================================

    filename = secure_filename(
        file.filename
    )


    video_path = os.path.join(

        app.config[
            "VIDEO_FOLDER"
        ],

        filename

    )


    file.save(
        video_path
    )


    # ========================================================
    # OUTPUT
    # ========================================================

    name_without_extension = (
        os.path.splitext(
            filename
        )[0]
    )


    output_filename = (
        "processed_"
        + name_without_extension
        + ".mp4"
    )


    output_path = os.path.join(

        app.config[
            "PROCESSED_FOLDER"
        ],

        output_filename

    )


    print(
        "Input:",
        video_path
    )

    print(
        "Output:",
        output_path
    )

    print(
        "===================================="
    )


    # ========================================================
    # PROCESS
    # ========================================================

    try:

        result = process_video(

            video_path,

            output_path

        )


        # ====================================================
        # VIDEO URL
        # ====================================================

        result[
            "video_url"
        ] = (
            "/processed/"
            + output_filename
        )


        return jsonify(
            result
        )


    except Exception as error:

        print(
            "VIDEO PROCESSING ERROR:"
        )

        print(
            str(error)
        )


        return jsonify({

            "success":
                False,

            "error":
                "Video processing failed",

            "details":
                str(error)

        }), 500


# ============================================================
# SERVE PROCESSED VIDEO
# ============================================================

@app.route(
    "/processed/<filename>",
    methods=["GET"]
)
def processed_video(
    filename
):

    return send_from_directory(

        app.config[
            "PROCESSED_FOLDER"
        ],

        filename

    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )