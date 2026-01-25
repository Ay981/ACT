// Simple fetch wrapper for connecting to a Laravel backend.
// Uses Vite env: VITE_API_BASE_URL (defaults to http://localhost:8000).

let API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
// Ensure protocol
if (!API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
    API_BASE = `https://${API_BASE}`
}
const BASE = API_BASE.replace(/\/$/, '')

// Initialize CSRF protection
export async function getCsrfToken() {
  await request('GET', '/sanctum/csrf-cookie')
}

// Admin Maintenance
export async function getMaintenanceStatus() {
    return request('GET', '/api/admin/maintenance')
}

export async function toggleMaintenance(enabled) {
    return request('POST', '/api/admin/maintenance', { enabled })
}

// Auth API
export async function login(credentials) {
  // 1. Get CSRF cookie first
  await getCsrfToken()
  // 2. Login
  return request('POST', '/login', credentials)
}

export async function logout() {
  await request('POST', '/logout')
}

export async function register(userData) {
  // 1. Get CSRF cookie first
  await getCsrfToken()
  // 2. Register
  return request('POST', '/register', userData)
}

export async function verifyOtp(data) {
    return request('POST', '/verify-otp', data)
}

export async function getUser() {
  return request('GET', '/api/user')
}

export async function updateProfile(data) {
  return request('PUT', '/api/profile', data)
}

export async function updatePassword(data) {
  return request('PUT', '/api/password', data)
}

export async function getInstructorQuizzes() {
  return request('GET', '/api/quizzes')
}

export async function getInstructorCourses() {
    return request('GET', '/api/instructor/courses')
}

export async function getAllCourses() {
    return request('GET', '/api/courses')
}

export async function getEnrolledCourses() {
    return request('GET', '/api/my-courses')
}

export async function createCourse(formData) {
    return request('POST', '/api/instructor/courses', formData) 
}

export async function addLesson(courseId, formData) {
    return request('POST', '/api/instructor/courses/' + courseId + '/lessons', formData)
}

async function request(method, path, body, signal) {
  const headers = { 'Accept': 'application/json' }
  
  if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
  }
  
  // Auto-attach CSRF token if present
  const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1]
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken)
  }

  const options = {
    method,
    headers,
    signal,
    credentials: 'include',
  }

  if (body) {
      options.body = body instanceof FormData ? body : JSON.stringify(body)
  }

  const res = await fetch(`${BASE}${path}`, options)
  
  if (!res.ok) {
    if (res.status === 503) {
        if (window.location.pathname !== '/maintenance') {
            window.location.href = '/maintenance'
            // Prevent further execution/promise resolution to stop React from handling error state
            // by returning a promise that never resolves while the page reloads.
            return new Promise(() => {}) 
        }
    }

    const text = await res.text().catch(() => '')
    try {
        const json = JSON.parse(text)
        const error = new Error(json.message || `API Error ${res.status}`)
        error.status = res.status
        error.response = { data: json } // Mimic axios structure for compatibility
        throw error
    } catch (e) {
        if (e.response) throw e // It's our parsed error
        throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`)
    }
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export function generateQuiz(payload, options = {}) {
  // Expected Laravel route: POST /api/quiz/generate
  // Payload example: { topic, difficulty, count }
  return request('POST', '/api/quiz/generate', payload, options.signal)
}

export function createQuiz(payload, options = {}) {
  // Expected Laravel route: POST /api/quizzes
  // Payload example: { title, description, category, difficulty, timeLimitMinutes, passingScorePercent, immediateResults, questions }
  return request('POST', '/api/quizzes', payload, options.signal)
}

// --- Mock Implementations for Frontend Dev (ToDo: Replace with real API calls) ---

export async function fetchDashboardData() {
  return request('GET', '/api/dashboard')
}

export async function getCourse(id) {
    return request('GET', `/api/courses/${id}`)
}

export async function enrollCourse(id) {
    return request('POST', `/api/courses/${id}/enroll`)
}

export function fetchQuiz(id) {
    return request('GET', `/api/quizzes/${id}`)
}

export function submitQuizAttempt(quizId, answers) {
    return request('POST', `/api/quizzes/${quizId}/attempt`, { answers })
}

export function getQuizAttempts(id) {
    return request('GET', `/api/quizzes/${id}/attempts`)
}

export function getMyAttempts() {
    return request('GET', '/api/my-attempts')
}

// --- Comments ---

export async function getComments(type, id) {
    const raw = await request('GET', `/api/comments?type=${type}&id=${id}`)
    // Map Laravel structure to UI structure
    const align = (c) => ({
        id: c.id,
        author: c.user?.name || 'Anonymous',
        userId: c.user_id,
        text: c.content,
        likes: c.likes_count || 0,
        isLiked: c.is_liked_by_me || false,
        createdAt: c.created_at,
        replies: c.replies ? c.replies.map(align) : []
    })
    return raw.map(align)
}

export async function createComment(payload) {
    // payload: { type, id, content, parent_id? }
    const c = await request('POST', '/api/comments', payload)
    return {
        id: c.id,
        author: c.user?.name || 'You',
        userId: c.user_id,
        text: c.content,
        likes: 0,
        isLiked: false,
        createdAt: c.created_at,
        replies: []
    }
}

export async function updateComment(id, text) {
    return request('PUT', `/api/comments/${id}`, { content: text })
}

export async function deleteComment(id) {
    return request('DELETE', `/api/comments/${id}`)
}

export async function toggleLikeComment(id) {
    return request('POST', `/api/comments/${id}/like`)
}

export async function getConversations() {
    return request('GET', '/api/messages')
}

export async function sendMessage(recipientId, message) {
    return request('POST', '/api/messages', { recipient_id: recipientId, message })
}

export async function initConversation(partnerId) {
    return request('GET', `/api/messages/init/${partnerId}`)
}

export async function markAsRead(partnerId) {
    return request('POST', `/api/messages/${partnerId}/read`)
}

export async function getUnreadCount() {
    return request('GET', '/api/messages/unread')
}

// Notifications
export async function getNotifications() {
    return request('GET', '/api/notifications')
}

export async function markNotificationRead(id) {
    return request('POST', `/api/notifications/${id}/read`)
}

// Admin / Reporting
export async function submitReport(payload) {
    // payload: { reportable_id, reportable_type, reason }
    return request('POST', '/api/reports', payload)
}

export async function getAdminReports() {
    return request('GET', '/api/admin/reports')
}

export async function resolveReport(id, action) {
    // action: 'ban', 'warn', 'restrict', 'dismiss'
    return request('POST', `/api/admin/reports/${id}/action`, { action })
}

export async function getAdminDashboardStats() {
    return request('GET', '/api/admin/dashboard')
}

export async function sendBroadcast(message, target) {
    return request('POST', '/api/admin/broadcast', { message, target })
}

export async function getInstructorDashboardStats() {
    return request('GET', '/api/instructor/dashboard')
}

export async function getAdminInstructors() {
    return request('GET', '/api/admin/instructors')
}

// AI Content
export async function generateCourseOutline(topic, level) {
    return request('POST', '/api/ai/course-outline', { topic, level })
}

export async function deleteAdminInstructor(id) {
    return request('DELETE', `/api/admin/instructors/${id}`)
}

export async function approveAdminInstructor(id) {
    return request('POST', `/api/admin/instructors/${id}/approve`)
}

