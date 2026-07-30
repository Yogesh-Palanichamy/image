import torch
from PIL import Image
import timm
from torchvision import transforms
# Load pretrained scene model
model = timm.create_model(
    "resnet50.a1_in1k",
    pretrained=True
)
model.eval()
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
])
def detect_scene(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image)
    image = image.unsqueeze(0)
    with torch.no_grad():
        output = model(image)
    prediction = torch.argmax(output, dim=1)
    return str(prediction.item())