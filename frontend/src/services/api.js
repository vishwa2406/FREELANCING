import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cegp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = err.config?.url || ''

    // Only auto-logout for protected-user check, NOT for login failure
    if (status === 401 && url.includes('/auth/me')) {
      localStorage.removeItem('cegp_token')
    }

    return Promise.reject(err)
  }
)

export default api

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (email, password) => api.post('/auth/login', { email, password }),
  forgot: (d) => api.post('/auth/forgot-password', d),
  reset: (token, d) => api.post(`/auth/reset-password/${token}`, d),
  me: () => api.get('/auth/me'),
  update: (d) => api.patch('/auth/me', d),
  changePassword: (d) => api.post('/auth/change-password', d),
}

export const courseAPI = {
  list: (p) => api.get('/courses', { params: p }),
  get: (id) => api.get(`/courses/${id}`),
  recommended: () => api.get('/courses/recommended'),
  bookmark: (id) => api.post(`/courses/${id}/bookmark`),
  create: (d) => api.post('/courses', d),
  update: (id, d) => api.patch(`/courses/${id}`, d),
  remove: (id) => api.delete(`/courses/${id}`),
}

export const lessonAPI = {
  list: (courseId) => api.get(`/lessons/course/${courseId}`),
  create: (courseId, d) => api.post(`/lessons/course/${courseId}`, d),
  update: (id, d) => api.patch(`/lessons/${id}`, d),
  remove: (id) => api.delete(`/lessons/${id}`),
}

export const quizAPI = {
  get: (id) => api.get(`/quizzes/${id}`),
  submit: (id, d) => api.post(`/quizzes/${id}/submit`, d),
  attempts: (id) => api.get(`/quizzes/${id}/attempts`),
  byCourse: (cid) => api.get(`/quizzes/course/${cid}`),
  create: (courseId, d) => api.post(`/quizzes/course/${courseId}`, d),
  update: (id, d) => api.patch(`/quizzes/${id}`, d),
}

export const jobAPI = {
  list: (p) => api.get('/jobs', { params: p }),
  get: (id) => api.get(`/jobs/${id}`),
  save: (id) => api.post(`/jobs/${id}/save`),
  saved: () => api.get('/jobs/saved'),
  recommended: () => api.get('/jobs/recommended'),
  adminList: (params) => api.get('/jobs/admin/all', { params }),
  create: (d) => api.post('/jobs', d),
  update: (id, d) => api.patch(`/jobs/${id}`, d),
  remove: (id) => api.delete(`/jobs/${id}`),
}

export const progressAPI = {
  me: (cid) => api.get('/progress', { params: { courseId: cid } }),
  start: (d) => api.post('/progress/start', d),
  complete: (d) => api.post('/progress/mark', d),
  stats: () => api.get('/progress/stats'),
  certificate: (courseId) => api.get(`/progress/certificate/${courseId}`),
}

export const mentorAPI = {
  list: () => api.get('/mentors'),
  request: (d) => api.post('/mentors/request', d),
  mine: () => api.get('/mentors/my-requests'),
  incoming: (params) => api.get('/mentors/incoming', { params }),
  updateRequest: (id, d) => api.patch(`/mentors/request/${id}`, d),
  addNote: (id, d) => api.post(`/mentors/request/${id}/note`, d),
}

export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, d) => api.patch(`/admin/users/${id}`, d),
  mentorRequests: (params) => api.get('/admin/mentor-requests', { params }),
  getMentors: () => api.get('/admin/mentors'),
  financeOverview: (params) => api.get('/admin/finance-overview', { params }),
  addTransaction: (d) => api.post('/admin/finance/tx', d),
  updateTransaction: (id, d) => api.patch(`/admin/finance/tx/${id}`, d),
  deleteTransaction: (id) => api.delete(`/admin/finance/tx/${id}`),
}

export const notificationAPI = {
  list: () => api.get('/notifications'),
  read: (id) => api.patch(`/notifications/${id}/read`)
}
export const financeAPI = {
  dashboard: (month) => api.get('/finance/dashboard', { params: month ? { month } : {} }),
  transactions: (params = {}) => api.get('/finance/tx', { params }),
  addTransaction: (data) => api.post('/finance/tx', data),
  updateTransaction: (id, data) => api.patch(`/finance/tx/${id}`, data),
  deleteTransaction: (id) => api.delete(`/finance/tx/${id}`),
  budgets: (month) => api.get('/finance/budgets', { params: month ? { month } : {} }),
  addBudget: (data) => api.post('/finance/budgets', data),
  updateBudget: (id, data) => api.patch(`/finance/budgets/${id}`, data),
  goals: () => api.get('/finance/goals'),
  addGoal: (data) => api.post('/finance/goals', data),
  updateGoal: (id, data) => api.patch(`/finance/goals/${id}`, data),
  calculator: (params) => api.get('/finance/calculators', { params }),
  exportCsv: () => api.get('/finance/tx/export.csv', { responseType: 'blob' }),
  exportPdf: (month) => api.get('/finance/reports/monthly.pdf', { params: { month }, responseType: 'blob' }),
}

export const financeAdminAPI = {
  overview: () => api.get('/finance-admin/overview'),
  tips: () => api.get('/finance-admin/tips'),
  addTip: (data) => api.post('/finance-admin/tips', data),
  updateTip: (id, data) => api.patch(`/finance-admin/tips/${id}`, data),
  deleteTip: (id) => api.delete(`/finance-admin/tips/${id}`),
}

export const freelancerAPI = {
  // Join flow
  requestJoin: (data) => api.post('/freelancer/request', data),
  getMyRequest: () => api.get('/freelancer/request/me'),

  // Client / User
  createProject: (data) => api.post('/freelancer/projects', data),
  getClientOverview: () => api.get('/freelancer/client-overview'),
  getMyProjects: () => api.get('/freelancer/projects/mine'),
  respondProposal: (projectId, proposalId, data) =>
    api.patch(`/freelancer/projects/${projectId}/proposals/${proposalId}`, data),
  getMyOrders: () => api.get('/freelancer/orders/mine'),
  payOrder: (orderId, data) => api.post(`/freelancer/orders/${orderId}/pay`, data),
  downloadInvoice: (orderId) =>
    api.get(`/freelancer/orders/${orderId}/invoice`, { responseType: 'blob' }),

  // Messages (Generic Chat)
  getMessages: (conversationId) => api.get(`/chat/${conversationId}`),
  sendMessage: (conversationId, data) => {
    // If data is FormData, axios handles headers automatically
    return api.post(`/chat/${conversationId}`, data);
  },

  // Freelancer panel
  getOverview: () => api.get('/freelancer/overview'),
  createService: (data) => api.post('/freelancer/services', data),
  getMyServices: () => api.get('/freelancer/services/mine'),
  updateService: (id, data) => api.patch(`/freelancer/services/${id}`, data),
  deleteService: (id) => api.delete(`/freelancer/services/${id}`),
  browseProjects: (params) => api.get('/freelancer/browse', { params }),
  sendProposal: (projectId, data) => api.post(`/freelancer/browse/${projectId}/propose`, data),
  getMyProposals: () => api.get('/freelancer/proposals/mine'),
  getFreelancerOrders: () => api.get('/freelancer/orders/freelancer'),
  markOrderCompleted: (orderId) => api.patch(`/freelancer/orders/${orderId}/complete`),
  getEarnings: () => api.get('/freelancer/earnings'),

  adminGetRequests: (params) => api.get('/freelancer/admin/requests', { params }),
  adminHandleRequest: (id, data) => api.patch(`/freelancer/admin/requests/${id}`, data),
}

export const conversationAPI = {
  list: () => api.get('/conversations'),
  start: (userId) => api.post('/conversations/start', { userId }),
  get: (id) => api.get(`/conversations/${id}`),
}

export const serviceAPI = {
  // Public endpoint to get active services
  getActiveServices: () => api.get('/services'),
  // Client creates order from a service (hire)
  hireService: (serviceId) => api.post('/services/order', { serviceId })
};
