from services.image_service import detect_objects
image_path = "uploads/images/test.jpeg"
objects = detect_objects(image_path)
print(objects)