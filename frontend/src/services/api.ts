import axios from 'axios';
import { AuthResponse, Curriculum, Dashboard, Lesson, Quiz, QuizResult, Resource, Project, CertificateEligibility, MintResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
  
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
};

// Curriculum API
export const curriculumAPI = {
  create: (): Promise<{ curriculum: Curriculum }> =>
    api.post('/curriculum').then(res => res.data),
  
  get: (): Promise<{ curriculum: Curriculum }> =>
    api.get('/curriculum').then(res => res.data),
  
  getWeeklyPlan: (week: number): Promise<{ weeklyPlan: any }> =>
    api.get(`/curriculum/week/${week}`).then(res => res.data),
  
  getDashboard: (): Promise<{ dashboard: Dashboard }> =>
    api.get('/curriculum/dashboard').then(res => res.data),
  
  completeWeek: (week: number): Promise<{ message: string }> =>
    api.post(`/curriculum/week/${week}/complete`).then(res => res.data),
  
  getWeekStatus: (week: number): Promise<{ isCompleted: boolean }> =>
    api.get(`/curriculum/week/${week}/status`).then(res => res.data),
};

// Lessons API
export const lessonsAPI = {
  getLesson: (lessonId: string): Promise<{ lesson: Lesson }> =>
    api.get(`/lessons/${lessonId}`).then(res => res.data),
  
  generateLesson: (subtopicId: string, curriculumId: string, subtopic: { title: string, description: string }): Promise<{ lesson: Lesson }> =>
    api.post(`/lessons/subtopic/${subtopicId}/${curriculumId}`, { subtopic }).then(res => res.data),
  
  getQuiz: (lessonId: string): Promise<{ quiz: Quiz }> =>
    api.get(`/lessons/${lessonId}/quiz`).then(res => res.data),
  
  submitQuiz: (quizId: string, answers: number[]): Promise<QuizResult> =>
    api.post(`/lessons/quiz/${quizId}/submit`, { answers }).then(res => res.data),
};

// Resources API
export const resourcesAPI = {
  getTopicResources: (topicId: string, curriculumId: string): Promise<{ resources: Resource[] }> =>
    api.get(`/resources/topics/${topicId}/${curriculumId}`).then(res => res.data),
  
  getModuleProjects: (moduleId: string, curriculumId: string): Promise<{ projects: Project[] }> =>
    api.get(`/resources/modules/${moduleId}/${curriculumId}/projects`).then(res => res.data),
  
  markResourceCompleted: (resourceId: string): Promise<{ message: string }> =>
    api.post(`/resources/${resourceId}/complete`).then(res => res.data),
  
  markProjectCompleted: (projectId: string): Promise<{ message: string }> =>
    api.post(`/resources/projects/${projectId}/complete`).then(res => res.data),
  
  getPortfolio: (): Promise<{ portfolio: any }> =>
    api.get('/resources/portfolio').then(res => res.data),
};

// Certificates & Payments API
export const certificatesAPI = {
  // Payment side
  getCertificatePrice: (): Promise<{ priceWei: string; priceEth: string; merchantAddress: string }> =>
    api.get('/payments/price').then(res => res.data),
    
  getPaymentEligibility: (curriculumId: string, userAddress?: string): Promise<CertificateEligibility> => {
    const config = userAddress ? { headers: { 'x-user-address': userAddress } } : {};
    return api.get(`/payments/eligibility?curriculumId=${curriculumId}`, config).then(res => res.data);
  },
  
  confirmOnchainPayment: (curriculumId: string, walletAddress: string, txHash: string): Promise<{ message: string }> =>
    api.post('/payments/confirm', { curriculumId, userAddress: walletAddress, txHash }).then(res => res.data),

  // Course eligibility (auth-based)
  getCourseEligibility: (curriculumId: string): Promise<CertificateEligibility> =>
    api.get(`/certificates/eligibility?curriculumId=${curriculumId}`).then(res => res.data),

  recordCertificatePayment: (curriculumId: string, walletAddress: string, paymentTxHash: string): Promise<{ message: string }> =>
    api.post('/certificates/payment-confirmed', { curriculumId, walletAddress, paymentTxHash }).then(res => res.data),
  
  requestMint: (curriculumId: string, walletAddress: string): Promise<MintResponse> =>
    api.post('/certificates/request-mint', { curriculumId, walletAddress }).then(res => res.data),
  
  recordMint: (curriculumId: string, walletAddress: string, tokenId: string, mintTxHash: string): Promise<{ message: string }> =>
    api.post('/certificates/minted', { curriculumId, walletAddress, tokenId, mintTxHash }).then(res => res.data),
};

export default api;
