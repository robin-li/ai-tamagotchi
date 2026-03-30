import axios from 'axios';
import { savePetToCache, getPetFromCache, getLastSyncTime } from '../services/offlineStorage';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => {
    // 當 GET /pet 成功時，自動存入 localStorage
    if (res.config.method === 'get' && res.config.url === '/pet' && res.data) {
      savePetToCache(res.data);
    }
    return res;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // 網路錯誤時，嘗試從 localStorage 取出 cached pet
    if (!error.response && error.config?.method === 'get' && error.config?.url === '/pet') {
      const cached = getPetFromCache();
      if (cached) {
        return {
          data: cached,
          status: 200,
          statusText: 'OK (offline cache)',
          headers: {},
          config: error.config,
          _fromCache: true,
          _lastSync: getLastSyncTime(),
        };
      }
    }

    return Promise.reject(error);
  },
);

export default client;
