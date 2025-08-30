import axios from 'axios';

const API_URL = 'http://localhost:3001/api/logistics'; // Adjust as per your backend logistics API endpoint

export const fetchLogisticsData = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching logistics data:', error);
    throw error;
  }
};

// You can add more functions here for other logistics operations (e.g., add, update, delete)