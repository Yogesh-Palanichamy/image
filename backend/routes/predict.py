from flask import Blueprint, request, jsonify
from services.image_service import detect_objects

predict_bp = Blueprint("predict", __name__)
@predict_bp.route("/image", methods=["POST"])
def predict_image():
    if "image" not in request.files:
        return jsonify({"error": "Image not found"})
    image = request.files["image"]
    return jsonify({
        "success": True,
        "objects": objects,
        "Prediction": "Image Prediction",
        "Confidence": "97.25%"
    })
@predict_bp.route("/video", methods=["POST"])
def predict_video():
    if "video" not in request.files:
        return jsonify({"error": "Video not found"})
    video = request.files["video"]
    return jsonify({
        "success": True,
        "objects": objects,
        "Prediction": "Video Prediction",
        "Confidence": "90.00%"
    })