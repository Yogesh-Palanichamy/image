from services.scene_service import detect_scene
image = "uploads/images/test.jpeg"
result = detect_scene(image)
print(result)