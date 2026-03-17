import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '@/views/Login.vue'

describe('Login.vue', () => {
  let wrapper

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  const createWrapper = () => {
    return mount(Login, {
      mocks: {
        $router: {
          push: vi.fn()
        },
        $route: {
          query: {}
        }
      }
    })
  }

  it('renders login form correctly', () => {
    wrapper = createWrapper()
    expect(wrapper.find('h1').text()).toBe('登录')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('登录')
  })

  it('shows validation error for empty email', async () => {
    wrapper = createWrapper()
    wrapper.vm.handleLogin()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.errors.email).toBe('请输入邮箱')
  })

  it('shows validation error for invalid email format', async () => {
    wrapper = createWrapper()
    wrapper.vm.email = 'invalid-email'
    wrapper.vm.password = '123456'
    await wrapper.vm.$nextTick()
    wrapper.vm.handleLogin()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.errors.email).toBe('请输入正确的邮箱格式')
  })

  it('shows validation error for short password', async () => {
    wrapper = createWrapper()
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = '123'
    await wrapper.vm.$nextTick()
    wrapper.vm.handleLogin()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.errors.password).toBe('密码至少6位')
  })

  it('shows error for invalid credentials', async () => {
    wrapper = createWrapper()
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = 'wrongpassword'
    await wrapper.vm.$nextTick()
    wrapper.vm.handleLogin()
    // Wait for async login
    await new Promise(resolve => setTimeout(resolve, 1500))
    expect(wrapper.vm.error).toBe('邮箱或密码错误')
  })

  it('logs in successfully with test credentials', async () => {
    wrapper = createWrapper()
    wrapper.vm.email = 'test@example.com'
    wrapper.vm.password = '123456'
    await wrapper.vm.$nextTick()
    wrapper.vm.handleLogin()
    // Wait for async login to start
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.loading).toBe(true)
    // Wait for async login to complete
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Check that the login was successful - token should be set in localStorage or sessionStorage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    expect(token).toBeTruthy()
  })

  it('logs in successfully with admin credentials', async () => {
    wrapper = createWrapper()
    wrapper.vm.email = 'admin@example.com'
    wrapper.vm.password = 'admin123'
    await wrapper.vm.$nextTick()
    wrapper.vm.handleLogin()
    // Wait for async login to start
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.loading).toBe(true)
    // Wait for async login to complete
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Check that the login was successful - token should be set in localStorage or sessionStorage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    expect(token).toBeTruthy()
  })

  it('shows password toggle button', async () => {
    wrapper = createWrapper()
    expect(wrapper.vm.showPassword).toBe(false)
    wrapper.find('.toggle-btn').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showPassword).toBe(true)
  })
})
