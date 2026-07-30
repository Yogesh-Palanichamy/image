from flask import Blueprint, jsonify
train_bp = Blueprint("train", __name__)
@train_bp.route("/", methods=["POST"])
def train_model():
    return jsonify({
        "Status": "Training Started",
        "Epochs": 10,
        "message": "Training started"
    })