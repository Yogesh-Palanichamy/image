import cv2
import mediapipe as mp


# ============================================================
# MEDIAPIPE FACE DETECTION
# ============================================================

mp_face_detection = mp.solutions.face_detection


# Create detector once
face_detector = mp_face_detection.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.5
)


# ============================================================
# DETECT FACES
# ============================================================

def detect_faces(image_path):

    try:

        # ----------------------------------------------------
        # Read image
        # ----------------------------------------------------

        image = cv2.imread(
            image_path
        )


        if image is None:

            print(
                f"Face image not found: {image_path}"
            )

            return []


        # ----------------------------------------------------
        # Convert BGR -> RGB
        # ----------------------------------------------------

        rgb_image = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )


        # ----------------------------------------------------
        # Run MediaPipe
        # ----------------------------------------------------

        results = face_detector.process(
            rgb_image
        )


        faces = []


        # ----------------------------------------------------
        # Read detections
        # ----------------------------------------------------

        if results.detections:

            height, width, _ = (
                image.shape
            )


            for detection in results.detections:

                bbox = (
                    detection
                    .location_data
                    .relative_bounding_box
                )


                confidence = 0.0

                if detection.score:

                    confidence = float(
                        detection.score[0]
                    )


                # ------------------------------------------------
                # Convert normalized coordinates to pixels
                # ------------------------------------------------

                xmin = int(
                    bbox.xmin * width
                )

                ymin = int(
                    bbox.ymin * height
                )

                bbox_width = int(
                    bbox.width * width
                )

                bbox_height = int(
                    bbox.height * height
                )


                # ------------------------------------------------
                # Keep coordinates inside image
                # ------------------------------------------------

                xmin = max(
                    0,
                    xmin
                )

                ymin = max(
                    0,
                    ymin
                )

                bbox_width = max(
                    0,
                    min(
                        bbox_width,
                        width - xmin
                    )
                )

                bbox_height = max(
                    0,
                    min(
                        bbox_height,
                        height - ymin
                    )
                )


                faces.append({

                    "xmin":
                        xmin,

                    "ymin":
                        ymin,

                    "width":
                        bbox_width,

                    "height":
                        bbox_height,

                    "confidence":
                        round(
                            confidence,
                            4
                        )

                })


        return faces


    except Exception as error:

        print(
            "Face Detection Error:",
            error
        )

        return []