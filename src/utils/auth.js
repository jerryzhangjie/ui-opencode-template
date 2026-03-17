const STORAGE_KEY = 'hr_system_auth'
const USER_KEY = 'hr_system_user'

/**
 * Login with username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {{ success: boolean, error?: string }}
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: '请输入用户名和密码' }
  }
  
  if (username === 'admin' && password === 'admin') {
    localStorage.setItem(STORAGE_KEY, 'true')
    localStorage.setItem(USER_KEY, JSON.stringify({ username }))
    return { success: true }
  }
  
  return { success: false, error: '用户名或密码错误' }
}

/**
 * Logout and clear auth state
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

/**
 * Get current user info
 * @returns {object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
