from services.analysis_service import analyze_image
image = r"D:\code\code\image\backend\uploads\images\ocr_test.png"
result = analyze_image(image)
print(result)