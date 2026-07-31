from services.face_service import detect_faces
image = r"D:\code\code\image\backend\uploads\images\ocr_test.png"
faces = detect_faces(image)
print(faces)
print("Number of faces:", len(faces))