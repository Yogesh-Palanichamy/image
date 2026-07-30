import easyocr
reader = easyocr.Reader(['en'])
def extract_text(image_path):
    results = reader.readtext(image_path)
    texts = []
    for result in results:
        texts.append(result[1])
    return texts