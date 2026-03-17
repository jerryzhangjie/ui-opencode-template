<template>
  <div class="home">
    <header class="header">
      <h1>杭州银行人力资源管理系统</h1>
      <div class="user-info">
        <span>欢迎，{{ username }}</span>
        <button @click="handleLogout">退出登录</button>
      </div>
    </header>
    <main class="main-content">
      <div class="welcome-card">
        <h2>欢迎使用人力资源管理系统</h2>
        <p>您已成功登录系统</p>
      </div>
    </main>
  </div>
</template>

<script>
import { getCurrentUser, logout } from '@/utils/auth'

export default {
  name: 'Home',
  data() {
    return {
      username: ''
    }
  },
  mounted() {
    const user = getCurrentUser()
    this.username = user ? user.username : 'admin'
  },
  methods: {
    handleLogout() {
      logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f6fa;
}

.header {
  background: linear-gradient(135deg, #1a5276 0%, #2980b9 100%);
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 24px;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info span {
  font-size: 14px;
}

.user-info button {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.user-info button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  padding: 40px;
}

.welcome-card {
  background: white;
  border-radius: 8px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.welcome-card h2 {
  color: #1a5276;
  margin-bottom: 15px;
}

.welcome-card p {
  color: #7f8c8d;
  font-size: 16px;
}
</style>
