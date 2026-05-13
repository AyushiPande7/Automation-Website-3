import axios from 'axios';

const ActionPointsAPI = {
  get: () => axios.get('/api/action-points'),
  save: (content) => axios.put('/api/action-points', { content }),
};

export default ActionPointsAPI;
