
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_KEY; 
// console.log('Gemini API Key:', API_KEY); 

const extractLocation = async (description) => {
  try {
    const response = await axios.post(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      {
        contents: [{ 
          parts: [{ 
            text: `Extract only the location/place name from this text and return just the location name without any additional text: "${description}"` 
          }] 
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const locationText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log(`Extracted location: "${locationText}"`);
    
    if (!locationText || locationText.length < 2) {
      throw new Error('No valid location extracted from description');
    }
    
    return locationText;
    
  } catch (error) {
    console.error('Error extracting location:', error.response?.data || error.message);
    
    // Fallback: try to extract location using simple regex patterns
    const locationPatterns = [
      /in\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2,})?)/i, // "in Manhattan, NYC"
      /at\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2,})?)/i, // "at Central Park"
      /([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2,}))/g, // "Manhattan, NYC"
    ];
    
    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        console.log(`Fallback extraction found: "${match[1]}"`);
        return match[1].trim();
      }
    }
    
    return null;
  }
}

export default extractLocation;