<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Left Panel - Bank Branding -->
      <div class="left-panel">
        <div class="logo-area">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 1.5L1.5 7l2 13.5L11.5 24l8-9.5-2-13.5L11.5 1.5zM11.5 3.5l6.5 4.5-1.5 10-5 6-5-6-1.5-10 6.5-4.5z"/>
              <path d="M11.5 8.5l-3.5 2.5 1 6.5 2.5 3 2.5-3 1-6.5-3.5-2.5z"/>
            </svg>
          </div>
          <div class="system-name">
            <span class="bank-name">杭州银行</span>
            <span class="module-name">人力资源管理系统</span>
          </div>
        </div>
        <div class="welcome-text">
          <h1>欢迎使用</h1>
          <p>专业的银行人力资源管理平台</p>
          <p class="sub-text">数据驱动决策，赋能组织发展</p>
        </div>
        <div class="decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="right-panel">
        <div class="login-card">
          <div class="card-header">
            <h2>用户登录</h2>
            <p>请输入账号密码登录系统</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="username">用户名</label>
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
                </svg>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  placeholder="请输入用户名"
                  autocomplete="username"
                  :class="{ 'has-error': errors.username }"
                  @blur="validateUsername"
                />
                <button
                  v-if="username"
                  type="button"
                  class="clear-btn"
                  @click="username = ''"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
                </svg>
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
                <span>记住密码</span>
              </label>
              <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">忘记密码？</a>
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>登 录</span>
            </button>

            <div v-if="error" class="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </div>
          </form>

          <div class="security-tips">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.586 11.586 0 007.626 2.277.75.75 0 001.38-.534 13.134 13.134 0 00-5.724-2.697 11.109 11.109 0 00-3.52 1.654.75.75 0 00.572 1.282zm3.137 3.325a.75.75 0 00-1.035.135 12.518 12.518 0 01-5.388 1.874.75.75 0 10-.502 1.373c1.62.856 3.428 1.573 5.334 2.085a.75.75 0 00.502-1.373 13.134 13.134 0 00-2.04-2.969zm3.503 3.39a.75.75 0 00-1.072.224A11.11 11.11 0 0112 21a11.11 11.11 0 01-5.939-2.166.75.75 0 00-.828.224.75.75 0 00.216 1.071c1.213.768 2.631 1.404 4.153 1.84a.75.75 0 00.828-.224A11.109 11.109 0 0012 22.5c-.596 0-1.177-.107-1.723-.302a.75.75 0 00-.216 1.07c1.14.7 2.45 1.257 3.86 1.622a.75.75 0 001.038-.673 13.134 13.134 0 01-2.92-3.068z" clip-rule="evenodd" />
              <path d="M11.354 1.646a.5.5 0 0 1 .708 0l13 13a.5.5 0 0 1-.708.708L11.5 2.707V14.5a.5.5 0 0 1-1 0V2.707L1.354 15.354a.5.5 0 0 1-.708-.708l13-13z" />
            </svg>
            <span>系统安全登录，保障您的信息安全</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { login } from '@/utils/auth'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      loading: false,
      error: '',
      errors: {
        username: '',
        password: ''
      }
    }
  },
  mounted() {
    this.redirect = this.$route?.query?.redirect || ''
  },
  methods: {
    validateUsername() {
      if (!this.username) {
        this.errors.username = '请输入用户名'
        return false
      }
      this.errors.username = ''
      return true
    },
    validatePassword() {
      if (!this.password) {
        this.errors.password = '请输入密码'
        return false
      }
      this.errors.password = ''
      return true
    },
    validateForm() {
      const isUsernameValid = this.validateUsername()
      const isPasswordValid = this.validatePassword()
      return isUsernameValid && isPasswordValid
    },
    async handleLogin() {
      this.error = ''
      
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const result = login(this.username, this.password)
        console.log('Login result:', result)
        
        if (result && result.success) {
          this.$router.push('/dashboard')
        } else {
          this.error = result?.error || '用户名或密码错误'
          this.password = ''
        }
      } catch (err) {
        console.error('Login error:', err)
        this.error = '登录失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    handleForgotPassword() {
      this.error = '请联系系统管理员重置密码'
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

.login-page {
  min-height: 100vh;
  font-family: 'IBM Plex Sans', sans-serif;
}

.login-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1E40AF 100%);
}

/* Left Panel */
.left-panel {
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 80px;
  position: relative;
  overflow: hidden;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #CA8A04 0%, #EAB308 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(202, 138, 4, 0.4);
}

.logo-icon svg {
  width: 48px;
  height: 48px;
  color: white;
}

.system-name {
  display: flex;
  flex-direction: column;
}

.bank-name {
  font-size: 28px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 2px;
}

.module-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.welcome-text {
  position: relative;
  z-index: 1;
}

.welcome-text h1 {
  font-size: 48px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16px;
  line-height: 1.2;
}

.welcome-text p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
}

.welcome-text .sub-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

/* Decoration circles */
.decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #CA8A04;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: #1E3A8A;
  bottom: -50px;
  left: 20%;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: #3B82F6;
  bottom: 10%;
  right: 10%;
}

/* Right Panel */
.right-panel {
  flex: 0 0 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8px;
}

.card-header p {
  font-size: 14px;
  color: #64748B;
}

/* Form */
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
  color: #0F172A;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94A3B8;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  height: 48px;
  padding: 0 44px 0 44px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  color: #0F172A;
  background: #FFFFFF;
  transition: all 0.2s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #94A3B8;
}

.input-wrapper input:focus {
  border-color: #1E3A8A;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.input-wrapper input.has-error {
  border-color: #DC2626;
  background: #FEF2F2;
}

.input-wrapper input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.clear-btn,
.toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: #94A3B8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
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
  color: #DC2626;
}

/* Form Options */
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
  border: 2px solid #CBD5E1;
  border-radius: 4px;
  background: #FFFFFF;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox:checked + .checkbox-custom {
  background: #1E3A8A;
  border-color: #1E3A8A;
}

.checkbox:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link {
  font-size: 14px;
  color: #1E3A8A;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Login Button */
.login-btn {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #CA8A04 0%, #B87A03 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #B87A03 0%, #A66B02 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(202, 138, 4, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-btn:disabled {
  background: #CBD5E1;
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

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 8px;
  color: #DC2626;
  font-size: 14px;
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Security Tips */
.security-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.security-tips svg {
  width: 16px;
  height: 16px;
  color: #16A34A;
}

.security-tips span {
  font-size: 12px;
  color: #64748B;
}

/* Responsive */
@media (max-width: 1024px) {
  .left-panel {
    flex: 0 0 45%;
    padding-left: 40px;
  }
  
  .right-panel {
    flex: 0 0 55%;
  }
  
  .welcome-text h1 {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .left-panel {
    flex: 0 0 auto;
    padding: 40px 24px;
    min-height: 280px;
  }
  
  .logo-area {
    margin-bottom: 24px;
  }
  
  .logo-icon {
    width: 60px;
    height: 60px;
  }
  
  .logo-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .bank-name {
    font-size: 22px;
  }
  
  .welcome-text h1 {
    font-size: 28px;
  }
  
  .welcome-text p {
    font-size: 16px;
  }
  
  .right-panel {
    flex: 1;
    padding: 24px;
  }
  
  .login-card {
    padding: 32px 24px;
  }
  
  .decoration {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-btn,
  .input-wrapper input,
  .checkbox-custom {
    transition: none;
  }
  
  .spinner {
    animation: none;
  }
}
</style>
