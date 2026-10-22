const API_URL = 'http://localhost:3000/api';

export const doctorService = {
  registrarDoctor: async (doctorData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(doctorData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registrando doctor:', error);
      throw error;
    }
  },
};
