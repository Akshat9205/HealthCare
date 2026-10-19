import api from './axios';

export const mappingApi = {
  getAll: async () => {
    const response = await api.get('/mappings');
    return response.data;
  },

  getByPatientId: async (patientId) => {
    const response = await api.get(`/mappings/${patientId}`);
    return response.data;
  },

  create: async (mappingData) => {
    const response = await api.post('/mappings', mappingData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/mappings/${id}`);
    return response.data;
  },
};

export default mappingApi;
