import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const csrfToken = getCsrfToken()
    if (csrfToken && config.headers) {
      config.headers['X-CSRFToken'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

function getCsrfToken(): string | null {
  const name = 'csrftoken'
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(name + '=')) {
      return trimmed.substring(name.length + 1)
    }
  }
  return null
}

export const getCsrfCookie = async () => {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/cuenta/csrf/`, {
      withCredentials: true,
    })
  } catch {
    // CSRF endpoint might not exist, that's ok
  }
}
