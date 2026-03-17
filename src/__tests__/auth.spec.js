import { describe, it, expect, beforeEach } from 'vitest'
import { login, logout, isAuthenticated, getCurrentUser } from '@/utils/auth'

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully with admin/admin', () => {
      const result = login('admin', 'admin')
      expect(result.success).toBe(true)
      expect(isAuthenticated()).toBe(true)
      expect(getCurrentUser()).toEqual({ username: 'admin' })
    })

    it('should fail with incorrect password', () => {
      const result = login('admin', 'wrong')
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户名或密码错误')
      expect(isAuthenticated()).toBe(false)
    })

    it('should fail with incorrect username', () => {
      const result = login('wrong', 'admin')
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户名或密码错误')
      expect(isAuthenticated()).toBe(false)
    })

    it('should fail with empty credentials', () => {
      const result = login('', '')
      expect(result.success).toBe(false)
      expect(result.error).toBe('请输入用户名和密码')
    })
  })

  describe('logout', () => {
    it('should logout and clear auth state', () => {
      login('admin', 'admin')
      expect(isAuthenticated()).toBe(true)
      
      logout()
      expect(isAuthenticated()).toBe(false)
      expect(getCurrentUser()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when not logged in', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('should return true after successful login', () => {
      login('admin', 'admin')
      expect(isAuthenticated()).toBe(true)
    })

    it('should persist auth state', () => {
      login('admin', 'admin')
      expect(isAuthenticated()).toBe(true)
    })
  })
})
