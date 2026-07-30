from flask import Flask
from flask_cors import CORS
from routes.upload import upload_bp
from routes.train import train_bp
from routes.predict import predict_bp
app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 500
app.register_blueprint(upload_bp, url_prefix="/upload")
app.register_blueprint(train_bp, url_prefix="/train")
app.register_blueprint(predict_bp, url_prefix="/predict")
@app.route("/")
def home():
    return {
        "Project": "Cross Domain Few Shot Model Adaptation Tool",
        "Status": "Running"
    }
if __name__ == "__main__":
    app.run(debug=True)