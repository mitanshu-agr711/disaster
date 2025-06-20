
import axios from 'axios';


const GEMINI_API_KEY = process.env.gimni_key;

async function imageUrlToBase64(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary').toString('base64');
}
const verifyImageWithGemini = async (imageUrl) => {

  const base64Image = await imageUrlToBase64(imageUrl);


  const payload = {
    model: "gemini-2.5-flash",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", 
              data: base64Image,
            },
          },
          {
            text: "Analyze this image. Is it real and relevant to a disaster? Is there any sign of manipulation?",
          },
        ],
      },
    ],
  };

  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
    payload
  );

  
  return response.data;
};

export default verifyImageWithGemini;