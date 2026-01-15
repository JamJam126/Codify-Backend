import axios from 'axios';

const API_URL = "http://localhost:3000/run";

async function submitJobs() {
  for (let i = 1; i <= 300; i++) {
    const payload = {
      language: "c",
      code: `print('Job Id : ${i}')`
    };

    try {
      const response = await axios.post(API_URL, payload);
      console.log(`Submitted Job ${i} - ID: ${response.data.jobId}`);
    } catch (error) {
      console.error(`Failed to submit Job ${i}:`, error.response?.data || error.message);
    }
  }
}

submitJobs();
