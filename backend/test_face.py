from services.face_service import detect_faces
image = "uploads/images/test.jpeg"
faces = detect_faces(image)
print(faces)