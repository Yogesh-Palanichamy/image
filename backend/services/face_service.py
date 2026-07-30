import cv2
import mediapipe as mp
face_detector = mp.solutions.face_detection.FaceDetection(
    model_selection=1,
    min_detection_confidence=0.5
)
def detect_faces(image_path):
    image = cv2.imread(image_path)
    rgb_image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )
    results = face_detector.process(rgb_image)
    faces = []
    if results.detections:
        for detection in results.detections:
            box = detection.location_data.relative_bounding_box
            faces.append({
                "confidence": round(
                    detection.score[0] * 100,
                    2
                ),
                "box": {
                    "x": round(box.x,3),
                    "y": round(box.y,3),
                    "width": round(box.width,3),
                    "height": round(box.height,3)
                }
            })
    return faces