from flask import Blueprint, request, jsonify
import os
upload_bp = Blueprint("upload", __name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
@upload_bp.route("/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image selected"}), 400
    file = request.files["image"]
    filename = file.filename
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    return jsonify({
        "message": "Image uploaded successfully",
        "filename": filename
    })
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video selected"}), 400
    file = request.files["video"]
    filename = file.filename
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    return jsonify({
        "message": "video uploaded successfully",
        "filename": filename
    })