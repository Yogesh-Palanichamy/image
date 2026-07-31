import api from "../services/api";
const uploadImage = async () => {
  const formData = new FormData();
  formData.append("image", selectedFile);
  const response = await api.post("/upload/image", formData);
  console.log(response.data);
};