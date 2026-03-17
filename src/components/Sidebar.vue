<template>
  <div class="sidebar">
    <!-- Logo section -->
    <div class="sidebar-header">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1011.313 0 8.25 8.25 0 00-11.313 0zm3.75 7.25a3.75 3.75 0 113.976 3.75 3.75 3.75 0 01-3.976-3.75z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="logo-text">
        <h2>杭州银行</h2>
        <p>OA办公系统</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul>
        <li
          v-for="item in navItems"
          :key="item.name"
          :class="{ active: activeItem === item.name }"
          @click="activeItem = item.name"
          class="nav-item"
        >
          <div class="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path :d="item.icon" />
            </svg>
          </div>
          <span class="nav-text">{{ item.label }}</span>
        </li>
      </ul>
    </nav>

    <!-- User profile at bottom -->
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="user-info">
          <p class="username">{{ username }}</p>
          <p class="role">系统管理员</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser } from '@/utils/auth'

export default {
  name: 'Sidebar',
  data() {
    return {
      activeItem: 'dashboard',
      username: '',
      navItems: [
        { name: 'dashboard', label: '首页', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
        { name: 'approval', label: '待办审批', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'announcement', label: '通知公告', icon: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069c-.18-.444-.388-.876-.622-1.294a19.04 19.04 0 00-1.488 1.338 19.145 19.145 0 00-1.415-1.414c.37-.464.8-.887 1.278-1.258a18.99 18.99 0 00-1.294-.622m13.53 4.894a20.935 20.935 0 001.46-4.282c.267-.578-.038-1.258-.59-1.465a20.902 20.902 0 01-4.282-1.46c.402-.89.733-1.82.984-2.783m0 0a18.97 18.97 0 01.09-2.09c.07-.688.09-1.386.09-2.09h-9a4.5 4.5 0 004.5 4.5c.99 0 1.934-.2 2.784-.56M14.25 9.75a4.5 4.5 0 004.5 4.5c.99 0 1.934-.2 2.784-.56.07-.687.09-1.386.09-2.09h-9a4.5 4.5 0 004.5 4.5z' },
        { name: 'attendance', label: '考勤打卡', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'meeting', label: '会议管理', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
        { name: 'document', label: '文档管理', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
        { name: 'profile', label: '个人中心', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
        { name: 'settings', label: '系统设置', icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z' },
      ]
    }
  },
  mounted() {
    const user = getCurrentUser()
    this.username = user ? user.username : 'admin'
  }
}
</script>

<style scoped>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(59, 130, 246, 0.9) 50%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 0 24px 24px 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    20px 0 40px rgba(0, 0, 0, 0.12),
    8px 0 16px rgba(0, 0, 0, 0.06),
    inset 1px 0 0 rgba(255, 255, 255, 0.1);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  font-family: 'Inter', sans-serif;
  color: white;
  transition: all 0.3s ease;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.logo-text h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.logo-text p {
  font-size: 13px;
  opacity: 0.8;
  font-weight: 400;
}

.sidebar-nav {
  flex: 1;
}

.sidebar-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.nav-text {
  font-size: 15px;
  font-weight: 500;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar svg {
  width: 24px;
  height: 24px;
  color: white;
}

.user-info .username {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}

.user-info .role {
  font-size: 12px;
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .sidebar {
    width: 260px;
    padding: 24px 20px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 240px;
    padding: 20px 16px;
    border-radius: 0 20px 20px 0;
  }
  
  .sidebar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .logo-text h2 {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 200px;
    padding: 16px 12px;
  }
  
  .nav-item {
    padding: 12px;
    gap: 12px;
  }
  
  .nav-text {
    font-size: 14px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .nav-item {
    transition: none;
  }
}

/* Focus styles for keyboard navigation */
.nav-item:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>