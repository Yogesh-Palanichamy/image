from services.ocr_service import extract_text
image = "uploads/images/test.jpeg"
text = extract_text(image)
print(text)