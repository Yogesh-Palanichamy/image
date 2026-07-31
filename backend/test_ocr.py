from services.ocr_service import extract_text
image = r"D:\code\code\image\backend\uploads\images\ocr_test.png"
result = extract_text(image)
print("Image:", image)
print("OCR Result:")
print(result)