from services.image_service import detect_objects
from services.caption_service import generate_caption
from services.ocr_service import extract_text
from services.scene_service import detect_scene

# Face Detection (Safe Import)
try:
    from services.face_service import detect_faces
except Exception as e:
    print("Face Detection Disabled:", e)
    detect_faces = None


def analyze_image(image_path):
    """
    Run all AI models on the uploaded image
    and return one combined JSON response.
    """

    # Object Detection
    try:
        objects = detect_objects(image_path)
    except Exception as e:
        print("Object Detection Error:", e)
        objects = []

    # Image Caption
    try:
        caption = generate_caption(image_path)
    except Exception as e:
        print("Caption Error:", e)
        caption = ""

    # OCR
    try:
        text = extract_text(image_path)
    except Exception as e:
        print("OCR Error:", e)
        text = []

    # Scene Recognition
    try:
        scene = detect_scene(image_path)
    except Exception as e:
        print("Scene Error:", e)
        scene = {}

    # Face Detection
    faces = []

    if detect_faces is not None:
        try:
            faces = detect_faces(image_path)
        except Exception as e:
            print("Face Detection Error:", e)
            faces = []

    return {
        "objects": objects,
        "caption": caption,
        "text": text,
        "scene": scene,
        "faces": faces
    }