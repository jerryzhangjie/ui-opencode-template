<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="header">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 6.75a5.25 5.25 0 110 10.5 5.25 5.25 0 010-10.5zm0 1.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" clip-rule="evenodd" />
            </svg>
          </div>
          <h1>登录</h1>
          <p class="subtitle">欢迎回来，请登录您的账号</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="请输入邮箱"
                autocomplete="email"
                :class="{ 'has-error': errors.email }"
                @blur="validateEmail"
              />
              <button
                v-if="email"
                type="button"
                class="clear-btn"
                @click="email = ''"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                autocomplete="current-password"
                :class="{ 'has-error': errors.password }"
                @blur="validatePassword"
              />
              <button
                type="button"
                class="toggle-btn"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="rememberMe" type="checkbox" class="checkbox" />
              <span class="checkbox-custom"></span>
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">忘记密码？</a>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>登录</span>
          </button>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="divider">
          <span>或</span>
        </div>

        <div class="third-party-section">
          <button class="third-party-btn wechat" @click="handleWechatLogin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            <span>微信登录</span>
          </button>
          <button class="third-party-btn google" @click="handleGoogleLogin">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google 登录</span>
          </button>
        </div>

        <p class="register-hint">
          没有账号？<a href="#" @click.prevent="handleRegister">立即注册</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      loading: false,
      error: '',
      errors: {
        email: '',
        password: ''
      }
    }
  },
  mounted() {
    this.redirect = this.$route?.query?.redirect || ''
  },
  methods: {
    validateEmail() {
      if (!this.email) {
        this.errors.email = '请输入邮箱'
        return false
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errors.email = '请输入正确的邮箱格式'
        return false
      }
      this.errors.email = ''
      return true
    },
    validatePassword() {
      if (!this.password) {
        this.errors.password = '请输入密码'
        return false
      }
      if (this.password.length < 6) {
        this.errors.password = '密码至少6位'
        return false
      }
      this.errors.password = ''
      return true
    },
    validateForm() {
      const isEmailValid = this.validateEmail()
      const isPasswordValid = this.validatePassword()
      return isEmailValid && isPasswordValid
    },
    async handleLogin() {
      this.error = ''
      
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockUsers = {
          'test@example.com': { password: '123456', name: 'Test User' },
          'admin@example.com': { password: 'admin123', name: 'Admin' }
        }

        const user = mockUsers[this.email]
        
        if (user && user.password === this.password) {
          const token = btoa(JSON.stringify({ email: this.email, name: user.name }))
          if (this.rememberMe) {
            localStorage.setItem('auth_token', token)
          } else {
            sessionStorage.setItem('auth_token', token)
          }
          
          this.$router.push(this.redirect || '/home')
        } else {
          this.error = '邮箱或密码错误'
        }
      } catch (err) {
        this.error = '登录失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    handleWechatLogin() {
      this.error = '微信登录暂未开放'
    },
    handleGoogleLogin() {
      this.error = 'Google 登录暂未开放'
    },
    handleForgotPassword() {
      this.error = '忘记密码功能暂未开放'
    },
    handleRegister() {
      this.error = '注册功能暂未开放'
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ECFDF5;
  font-family: 'Nunito Sans', sans-serif;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #059669, #10B981);
  border-radius: 12px;
  margin-bottom: 16px;
}

.logo svg {
  width: 28px;
  height: 28px;
  color: white;
}

h1 {
  font-family: 'Rubik', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #64748B;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 12px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  color: #1E293B;
  background: #FFFFFF;
  transition: all 0.2s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #94A3B8;
}

.input-wrapper input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.input-wrapper input.has-error {
  border-color: #EF4444;
}

.input-wrapper input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.clear-btn,
.toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  color: #94A3B8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover,
.toggle-btn:hover {
  color: #64748B;
}

.clear-btn svg,
.toggle-btn svg {
  width: 16px;
  height: 16px;
}

.error-text {
  font-size: 12px;
  color: #EF4444;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748B;
  cursor: pointer;
}

.checkbox {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  background: #FFFFFF;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox:checked + .checkbox-custom {
  background: #059669;
  border-color: #059669;
}

.checkbox:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link {
  font-size: 14px;
  color: #059669;
  text-decoration: none;
}

.forgot-link:hover {
  color: #047857;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover:not(:disabled) {
  background: #047857;
}

.login-btn:disabled {
  background: #94A3B8;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #EF4444;
  font-size: 14px;
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #E2E8F0;
}

.divider span {
  padding: 0 16px;
  font-size: 14px;
  color: #94A3B8;
}

.third-party-section {
  display: flex;
  gap: 12px;
}

.third-party-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
  cursor: pointer;
  transition: all 0.2s ease;
}

.third-party-btn:hover {
  background: #F8FAFC;
}

.third-party-btn svg {
  width: 20px;
  height: 20px;
}

.third-party-btn.wechat {
  color: #07C160;
}

.third-party-btn.wechat:hover {
  background: rgba(7, 193, 96, 0.1);
  border-color: #07C160;
}

.third-party-btn.google {
  color: #4285F4;
}

.third-party-btn.google:hover {
  background: rgba(66, 133, 244, 0.1);
  border-color: #4285F4;
}

.register-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #64748B;
}

.register-hint a {
  color: #059669;
  text-decoration: none;
  font-weight: 500;
}

.register-hint a:hover {
  color: #047857;
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .login-btn,
  .third-party-btn,
  .input-wrapper input,
  .checkbox-custom {
    transition: none;
  }
  
  .spinner {
    animation: none;
  }
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .login-container {
    max-width: 90%;
  }
}

/* Mobile: < 768px */
@media (max-width: 767px) {
  .login-card {
    padding: 24px;
  }
  
  .third-party-section {
    flex-direction: column;
  }
}
</style>
