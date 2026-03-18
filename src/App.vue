<template>
  <div id="app">
    <!-- Login Page - No sidebar/header -->
    <template v-if="$route.name === 'Login'">
      <router-view />
    </template>
    
    <!-- Dashboard Page - Custom header -->
    <template v-else-if="$route.name === 'Dashboard'">
      <div class="dashboard-layout">
        <!-- Top Navigation Bar -->
        <header class="navbar">
          <div class="navbar-left">
            <div class="logo">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.5 1.5L1.5 7l2 13.5L11.5 24l8-9.5-2-13.5L11.5 1.5z"/>
                </svg>
              </div>
              <span class="logo-text">杭州银行 HR系统</span>
            </div>
          </div>
          <div class="navbar-right">
            <div class="user-info">
              <div class="avatar">{{ userAvatar }}</div>
              <span class="username">{{ username }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9a.75.75 0 01-1.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
              <span>退出登录</span>
            </button>
          </div>
        </header>
        
        <!-- Main Content -->
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </template>
    
    <!-- Other Pages - With sidebar and header -->
    <template v-else>
      <Sidebar />
      <Header :page-title="pageTitle" />
      <main class="app-main">
        <router-view />
      </main>
    </template>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { getCurrentUser, logout } from '@/utils/auth'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header
  },
  data() {
    return {
      username: '',
      userAvatar: 'A'
    }
  },
  computed: {
    pageTitle() {
      const routeName = this.$route.name
      const titleMap = {
        Dashboard: '首页',
        Approval: '待办审批',
        Announcement: '通知公告',
        Attendance: '考勤打卡',
        Meeting: '会议管理',
        Document: '文档管理',
        Profile: '个人中心',
        Settings: '系统设置'
      }
      return titleMap[routeName] || '杭州银行OA系统'
    }
  },
  mounted() {
    const user = getCurrentUser()
    if (user) {
      this.username = user.name || user.username
      this.userAvatar = user.name ? user.name.charAt(0).toUpperCase() : 'A'
    }
  },
  methods: {
    handleLogout() {
      logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'IBM Plex Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Dashboard Layout - Full width, no sidebar */
.dashboard-layout {
  min-height: 100vh;
  background: #F8FAFC;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #0F172A;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #CA8A04 0%, #EAB308 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 1px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.username {
  color: #F8FAFC;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #F8FAFC;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn svg {
  width: 16px;
  height: 16px;
}

/* Main Content */
.main-content {
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

/* App Main - With sidebar */
.app-main {
  margin-left: 280px;
  padding-top: 80px;
  transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 1024px) {
  .app-main {
    margin-left: 260px;
  }
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 240px;
  }
  
  .navbar {
    padding: 0 20px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .app-main {
    margin-left: 200px;
  }
  
  .logout-btn span {
    display: none;
  }
}
</style>
