from services.caption_service import generate_caption
image = r"D:\code\code\image\backend\uploads\images\ocr_test.png"
caption = generate_caption(image)
print("Caption:")
print(caption)