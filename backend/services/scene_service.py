import torch
from torchvision import models, transforms
from PIL import Image
# Load a pretrained ResNet18 as a placeholder
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
model.eval()
transform = transforms.Compose([transforms.Resize((224, 224)),transforms.ToTensor(),])
def detect_scene(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0)
    with torch.no_grad():
        outputs = model(image)
    predicted = outputs.argmax(dim=1).item()
    return {
        "scene": f"Class ID {predicted}",
        "confidence": float(torch.softmax(outputs, dim=1)[0][predicted])
    }