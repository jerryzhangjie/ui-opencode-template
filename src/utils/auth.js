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
    return { success: false, error: '用户名和密码不能为空' }
  }
  
  // Mock user data - admin/admin
  if (username === 'admin' && password === 'admin') {
    const token = 'mock_token_' + Date.now()
    localStorage.setItem(STORAGE_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify({ 
      username, 
      name: '系统管理员',
      avatar: 'A'
    }))
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
  return !!localStorage.getItem(STORAGE_KEY)
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
