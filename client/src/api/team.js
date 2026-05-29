import axios from 'axios';

const TeamAPI = {
  getTeam: () => axios.get('/api/team'),

  /** Creates a member. Accepts either a plain object or a FormData instance. */
  createMember: (data) => {
    const fd = data instanceof FormData ? data : buildFormData(data);
    return axios.post('/api/team', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  /** Updates a member. Accepts either a plain object or a FormData instance. */
  updateMember: (id, data) => {
    const fd = data instanceof FormData ? data : buildFormData(data);
    return axios.put(`/api/team/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  deleteMember: (id) => axios.delete(`/api/team/${id}`),

  /** Batch-update sortOrder after drag-and-drop reorder - edited by INAP */
  reorderMembers: (order) => axios.patch('/api/team/reorder', { order }),
};

/** Convert a plain object to FormData (used when no file is attached) */
function buildFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

export default TeamAPI;
