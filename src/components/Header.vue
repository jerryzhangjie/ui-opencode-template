<template>
  <header class="header">
    <!-- Left side: Search and title -->
    <div class="header-left">
      <div class="page-title">
        <h1>{{ pageTitle }}</h1>
      </div>
      <div class="search-container">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索..."
          class="search-input"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
        />
      </div>
    </div>

    <!-- Right side: Notifications and user -->
    <div class="header-right">
      <!-- Notifications -->
      <div class="notifications" @click="toggleNotifications">
        <div class="notification-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.479.248A8.219 8.219 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.118 1 8.22 8.22 0 011.987 4.124.75.75 0 001.48-.248A9.72 9.72 0 0019.267 2.5z" />
            <path fill-rule="evenodd" d="M12 2.25A6.75 6.75 0 005.25 9v.75a8.217 8.217 0 01-2.119 5.52.75.75 0 00.298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 107.48 0 24.583 24.583 0 004.83-1.244.75.75 0 00.298-1.205 8.219 8.219 0 01-2.118-5.52V9A6.75 6.75 0 0012 2.25zM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 004.496 0l.002.1a2.25 2.25 0 11-4.5 0z" clip-rule="evenodd" />
          </svg>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </div>
      </div>

      <!-- User dropdown -->
      <div class="user-dropdown" @click="toggleUserMenu">
        <div class="user-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="user-info">
          <p class="username">{{ username }}</p>
          <p class="role">系统管理员</p>
        </div>
        <div class="dropdown-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Dropdown menu -->
        <div v-if="userMenuOpen" class="dropdown-menu">
          <div class="menu-item" @click="goToProfile">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
            </svg>
            <span>个人资料</span>
          </div>
          <div class="menu-item" @click="goToSettings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
            </svg>
            <span>系统设置</span>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item logout" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9a.75.75 0 01-1.5 0V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd" />
            </svg>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { getCurrentUser, logout } from '@/utils/auth'

export default {
  name: 'Header',
  props: {
    pageTitle: {
      type: String,
      default: '首页'
    }
  },
  data() {
    return {
      searchQuery: '',
      searchFocused: false,
      userMenuOpen: false,
      notificationsOpen: false,
      unreadCount: 3,
      username: ''
    }
  },
  mounted() {
    const user = getCurrentUser()
    this.username = user ? user.username : 'admin'
  },
  methods: {
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
      this.notificationsOpen = false
    },
    toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen
      this.userMenuOpen = false
      if (this.notificationsOpen && this.unreadCount > 0) {
        this.unreadCount = 0
      }
    },
    goToProfile() {
      this.$router.push('/profile')
      this.userMenuOpen = false
    },
    goToSettings() {
      this.$router.push('/settings')
      this.userMenuOpen = false
    },
    handleLogout() {
      logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.header {
  position: fixed;
  top: 0;
  left: 280px; /* Match sidebar width */
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 99;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.page-title h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1E293B;
  letter-spacing: -0.02em;
  margin: 0;
}

.search-container {
  position: relative;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #64748B;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 400;
  color: #1E293B;
  transition: all 0.2s ease;
  outline: none;
  cursor: pointer;
}

.search-input::placeholder {
  color: #94A3B8;
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.95);
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input:hover {
  border-color: #94A3B8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notifications {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.notifications:hover {
  background: rgba(148, 163, 184, 0.05);
}

.notification-icon {
  width: 24px;
  height: 24px;
  color: #64748B;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #F97316;
  color: white;
  font-size: 11px;
  font-weight: 600;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563EB, #3B82F6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

.user-avatar svg {
  width: 20px;
  height: 20px;
  color: white;
}

.user-info {
  text-align: left;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
  line-height: 1.2;
}

.role {
  font-size: 12px;
  color: #64748B;
  margin: 0;
  line-height: 1.2;
}

.dropdown-arrow {
  width: 20px;
  height: 20px;
  color: #64748B;
  transition: transform 0.2s ease;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 8px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #1E293B;
  font-size: 14px;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(148, 163, 184, 0.05);
}

.menu-item svg {
  width: 16px;
  height: 16px;
  color: #64748B;
}

.menu-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.1);
  margin: 8px;
}

.logout {
  color: #DC2626;
}

.logout svg {
  color: #DC2626;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .header {
    left: 260px;
    padding: 0 24px;
  }
  
  .search-container {
    width: 240px;
  }
}

@media (max-width: 768px) {
  .header {
    left: 240px;
    padding: 0 20px;
    height: 70px;
  }
  
  .page-title h1 {
    font-size: 20px;
  }
  
  .search-container {
    display: none;
  }
}

@media (max-width: 480px) {
  .header {
    left: 200px;
    padding: 0 16px;
    height: 64px;
  }
  
  .page-title h1 {
    font-size: 18px;
  }
  
  .user-info {
    display: none;
  }
  
  .dropdown-menu {
    width: 180px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .header,
  .user-dropdown,
  .search-input,
  .menu-item {
    transition: none;
  }
}

/* Focus styles for keyboard navigation */
.search-input:focus,
.notifications:focus,
.user-dropdown:focus,
.menu-item:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
</style>