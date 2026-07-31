from ultralytics import YOLO

# Load the YOLO model once
model = YOLO("yolov8n.pt")


def detect_objects(image_path):
    results = model(image_path)

    detected_objects = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detected_objects.append({
                "name": model.names[class_id],
                "confidence": round(confidence * 100, 2)
            })

    return detected_objects