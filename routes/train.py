from flask import Blueprint, jsonify

train_bp = Blueprint("train", __name__)

@train_bp.route("/train", methods=["POST"])
def train():

    return jsonify({
        "Status": "Training Started",
        "Epochs": 10
    })