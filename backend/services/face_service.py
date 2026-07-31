import cv2
import mediapipe as mp
mp_face_detection = mp.solutions.face_detection
face_detector = mp_face_detection.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.5
)
def detect_faces(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return []
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_detector.process(rgb_image)
    faces = []
    if results.detections:
        height, width, _ = image.shape
        for detection in results.detections:
            bbox = detection.location_data.relative_bounding_box
            faces.append({
                "xmin": int(bbox.xmin * width),
                "ymin": int(bbox.ymin * height),
                "width": int(bbox.width * width),
                "height": int(bbox.height * height),
                "confidence": float(detection.score[0])
            })
    return faces