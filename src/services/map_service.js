import axios from 'axios';

const geocode = async (placeName) => {
  try {

    
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: placeName,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'DisasterReliefApp/1.0 mishuagr2006@gmail.com',
      },
      timeout: 10000, 
    });

    // console.log(`Geocoding response for "${placeName}":`, response.data);

    if (!response.data || response.data.length === 0) {
      throw new Error(`No location found for: ${placeName}`);
    }

    const { lat, lon } = response.data[0];
    
    if (!lat || !lon) {
      throw new Error(`Invalid coordinates returned for: ${placeName}`);
    }

    const coordinates = { 
      lat: parseFloat(lat), 
      lon: parseFloat(lon) 
    };
    
    // console.log(`Successfully geocoded "${placeName}" to:`, coordinates);
    return coordinates;
    
  } catch (error) {
    console.error(`Geocoding error for "${placeName}":`, error.message);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Geocoding request timed out');
    }
    throw error;
  }
};
export default geocode;
