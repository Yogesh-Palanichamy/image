from flask import Blueprint, request, jsonify

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({"error": "Image not found"})

    image = request.files["image"]

    return jsonify({
        "Prediction": "Cow",
        "Confidence": "97.25%"
    })