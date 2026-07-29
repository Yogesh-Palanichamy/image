import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

MODEL_FOLDER = os.path.join(BASE_DIR, "checkpoints")

OUTPUT_FOLDER = os.path.join(BASE_DIR, "outputs")

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png"
}

BATCH_SIZE = 32

IMAGE_SIZE = 224

LEARNING_RATE = 0.0001

EPOCHS = 10

DEVICE = "cuda"

MODEL_NAME = "resnet50"