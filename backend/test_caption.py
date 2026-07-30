from services.caption_service import generate_caption
image = "uploads/images/test.jpeg"
caption = generate_caption(image)
print(caption)