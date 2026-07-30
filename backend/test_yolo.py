from ultralytics import YOLO
# Load the pretrained YOLOv8 model
model = YOLO("yolov8n.pt")
# Run detection on an image
results = model("test_images/1.jpeg")
# Print detected objects
for result in results:
    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        print(
            f"Object: {model.names[class_id]}, "
            f"Confidence: {confidence:.2f}"
        )