import os
import cv2

from collections import Counter
from ultralytics import YOLO


# ============================================================
# YOLO MODEL
# ============================================================

MODEL_PATH = "models/yolov8n.pt"

model = YOLO(MODEL_PATH)


# ============================================================
# PROCESS VIDEO
# ============================================================

def process_video(video_path, output_path=None):

    print()
    print("====================================")
    print("VIDEO PROCESSING STARTED")
    print("Input:", video_path)
    print("Output:", output_path)
    print("====================================")

    # ========================================================
    # CHECK FILE
    # ========================================================

    if not os.path.exists(video_path):

        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    # ========================================================
    # OPEN VIDEO
    # ========================================================

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():

        raise ValueError(
            "Unable to open video"
        )

    # ========================================================
    # VIDEO INFORMATION
    # ========================================================

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    width = int(
        cap.get(
            cv2.CAP_PROP_FRAME_WIDTH
        )
    )

    height = int(
        cap.get(
            cv2.CAP_PROP_FRAME_HEIGHT
        )
    )

    if fps <= 0:

        fps = 25

    duration = (
        total_frames / fps
    )

    print("FPS:", fps)
    print("Total frames:", total_frames)
    print("Resolution:", width, "x", height)
    print("Duration:", round(duration, 2))

    # ========================================================
    # OUTPUT VIDEO
    # ========================================================

    writer = None

    if output_path:

        output_folder = os.path.dirname(
            output_path
        )

        if output_folder:

            os.makedirs(
                output_folder,
                exist_ok=True
            )

        fourcc = cv2.VideoWriter_fourcc(
            *"mp4v"
        )

        writer = cv2.VideoWriter(
            output_path,
            fourcc,
            fps,
            (width, height)
        )

        if not writer.isOpened():

            cap.release()

            raise ValueError(
                "Unable to create output video"
            )

    # ========================================================
    # STATISTICS
    # ========================================================

    object_counter = Counter()

    confidence_values = {}

    frame_detections = []

    processed_frames = 0

    # ========================================================
    # PROCESS VIDEO
    # ========================================================

    while True:

        success, frame = cap.read()

        if not success:

            break

        processed_frames += 1

        # ====================================================
        # YOLO DETECTION
        # ====================================================

        results = model(
            frame,
            verbose=False,
            imgsz=640,
            conf=0.25
        )

        result = results[0]

        current_frame_objects = []

        # ====================================================
        # DETECTIONS
        # ====================================================

        if result.boxes is not None:

            for box in result.boxes:

                class_id = int(
                    box.cls[0].item()
                )

                confidence = float(
                    box.conf[0].item()
                )

                object_name = model.names[
                    class_id
                ]

                # --------------------------------------------
                # COUNT
                # --------------------------------------------

                object_counter[
                    object_name
                ] += 1

                # --------------------------------------------
                # CONFIDENCE
                # --------------------------------------------

                if object_name not in confidence_values:

                    confidence_values[
                        object_name
                    ] = []

                confidence_values[
                    object_name
                ].append(
                    confidence
                )

                # --------------------------------------------
                # FRAME DETECTION
                # --------------------------------------------

                current_frame_objects.append({

                    "object":
                        object_name,

                    "confidence":
                        round(
                            confidence,
                            4
                        )

                })

        # ====================================================
        # SAVE FRAME DETAILS
        # ====================================================

        if current_frame_objects:

            frame_detections.append({

                "frame":
                    processed_frames,

                "time":
                    round(
                        processed_frames / fps,
                        2
                    ),

                "objects":
                    current_frame_objects

            })

        # ====================================================
        # WRITE PROCESSED VIDEO
        # ====================================================

        if writer:

            annotated_frame = result.plot()

            writer.write(
                annotated_frame
            )

        # ====================================================
        # PROGRESS
        # ====================================================

        if (
            processed_frames % 50 == 0
            or processed_frames == total_frames
        ):

            percentage = (
                processed_frames /
                total_frames
            ) * 100

            print(
                f"Processing: "
                f"{percentage:.1f}% "
                f"({processed_frames}/{total_frames})"
            )

    # ========================================================
    # RELEASE
    # ========================================================

    cap.release()

    if writer:

        writer.release()

    # ========================================================
    # CONFIDENCE STATISTICS
    # ========================================================

    average_confidence = {}

    highest_confidence = {}

    lowest_confidence = {}

    for object_name, values in (
        confidence_values.items()
    ):

        if values:

            average_confidence[
                object_name
            ] = round(
                sum(values) /
                len(values),
                4
            )

            highest_confidence[
                object_name
            ] = round(
                max(values),
                4
            )

            lowest_confidence[
                object_name
            ] = round(
                min(values),
                4
            )

    # ========================================================
    # OBJECT SUMMARY
    # ========================================================

    objects = {}

    for object_name, count in (
        object_counter.items()
    ):

        objects[object_name] = {

            "detections":
                count,

            "average_confidence":
                average_confidence.get(
                    object_name,
                    0
                ),

            "highest_confidence":
                highest_confidence.get(
                    object_name,
                    0
                ),

            "lowest_confidence":
                lowest_confidence.get(
                    object_name,
                    0
                )

        }

    # ========================================================
    # FINAL RESULT
    # ========================================================

    result_data = {

        "success":
            True,

        "duration":
            round(
                duration,
                2
            ),

        "fps":
            round(
                fps,
                2
            ),

        "width":
            width,

        "height":
            height,

        "total_frames":
            total_frames,

        "processed_frames":
            processed_frames,

        "objects":
            objects,

        "frame_detections":
            frame_detections

    }

    print()
    print("====================================")
    print("VIDEO PROCESSING COMPLETED")
    print("Objects:", dict(object_counter))
    print("Processed frames:", processed_frames)
    print("====================================")

    return result_data