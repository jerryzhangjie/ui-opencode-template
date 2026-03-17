<template>
  <div class="dashboard">
    <!-- Main content -->
    <main class="main-content">
      <!-- Welcome banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h2>欢迎回来，{{ username }}！</h2>
          <p>今天是 {{ currentDate }}，您有 {{ pendingCount }} 项待办审批需要处理。</p>
        </div>
        <div class="welcome-actions">
          <button class="primary-button" @click="goToApproval">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clip-rule="evenodd" />
            </svg>
            处理待办
          </button>
          <button class="secondary-button" @click="goToAttendance">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" clip-rule="evenodd" />
            </svg>
            考勤打卡
          </button>
        </div>
      </div>
      
      <!-- Quick stats -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(37, 99, 235, 0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563EB">
              <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ stats.documents }}</h3>
            <p>文档总数</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(249, 115, 22, 0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F97316">
              <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ stats.pending }}</h3>
            <p>待办审批</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981">
              <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ stats.meetings }}</h3>
            <p>今日会议</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(139, 92, 246, 0.1);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8B5CF6">
              <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ stats.announcements }}</h3>
            <p>通知公告</p>
          </div>
        </div>
      </div>
      
      <!-- Main feature cards -->
      <div class="feature-cards">
        <h3 class="section-title">常用功能</h3>
        <div class="cards-grid">
            <div 
              v-for="card in featureCards"
              :key="card.id"
              class="feature-card glass-card"
              tabindex="0"
              @click="goToFeature(card.route)"
              @keyup.enter="goToFeature(card.route)"
            >
            <div class="card-icon" :style="{ background: card.iconBg }">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path :d="card.icon" />
              </svg>
            </div>
            <div class="card-content">
              <h4>{{ card.title }}</h4>
              <div v-if="card.type === 'count'" class="card-count">{{ card.count }}</div>
              <div v-else-if="card.type === 'success'" class="card-status status-success">{{ card.status }}</div>
              <div v-else-if="card.type === 'info'" class="card-status status-info">{{ card.status }}</div>
              <div class="card-hint">点击查看详情</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { getCurrentUser } from '@/utils/auth'

export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      currentDate: '',
      pendingCount: 5,
      stats: {
        documents: 128,
        pending: 5,
        meetings: 3,
        announcements: 12
      },
      featureCards: [
        {
          id: 1,
          title: '待办审批',
          icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          iconBg: 'rgba(37, 99, 235, 0.1)',
          route: '/approval',
          count: '3条待处理',
          type: 'count'
        },
        {
          id: 2,
          title: '通知公告',
          icon: 'M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069c-.18-.444-.388-.876-.622-1.294a19.04 19.04 0 00-1.488 1.338 19.145 19.145 0 00-1.415-1.414c.37-.464.8-.887 1.278-1.258a18.99 18.99 0 00-1.294-.622m13.53 4.894a20.935 20.935 0 001.46-4.282c.267-.578-.038-1.258-.59-1.465a20.902 20.902 0 01-4.282-1.46c.402-.89.733-1.82.984-2.783m0 0a18.97 18.97 0 01.09-2.09c.07-.688.09-1.386.09-2.09h-9a4.5 4.5 0 004.5 4.5c.99 0 1.934-.2 2.784-.56M14.25 9.75a4.5 4.5 0 004.5 4.5c.99 0 1.934-.2 2.784-.56.07-.687.09-1.386.09-2.09h-9a4.5 4.5 0 004.5 4.5z',
          iconBg: 'rgba(249, 115, 22, 0.1)',
          route: '/announcement',
          count: '5条未读',
          type: 'count'
        },
        {
          id: 3,
          title: '考勤打卡',
          icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
          iconBg: 'rgba(16, 185, 129, 0.1)',
          route: '/attendance',
          status: '已签到',
          type: 'success'
        },
        {
          id: 4,
          title: '会议管理',
          icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
          iconBg: 'rgba(139, 92, 246, 0.1)',
          route: '/meeting',
          count: '2个会议',
          type: 'count'
        },
        {
          id: 5,
          title: '文档管理',
          icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
          iconBg: 'rgba(236, 72, 153, 0.1)',
          route: '/document',
          count: '12份文档',
          type: 'count'
        },
        {
          id: 6,
          title: '个人中心',
          icon: 'M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z',
          iconBg: 'rgba(59, 130, 246, 0.1)',
          route: '/profile',
          status: '查看资料',
          type: 'info'
        }
      ]
    }
  },
  mounted() {
    const user = getCurrentUser()
    this.username = user ? user.username : 'admin'
    this.formatCurrentDate()
  },
  methods: {
    formatCurrentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const weekday = weekdays[now.getDay()]
      this.currentDate = `${year}年${month}月${day}日 ${weekday}`
    },
    goToApproval() {
      this.$router.push('/approval')
    },
    goToAttendance() {
      this.$router.push('/attendance')
    },
    goToFeature(route) {
      this.$router.push(route)
    }
  }
}
</script>

<style scoped>
/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.dashboard {
  min-height: 100vh;
  background: #F8FAFC;
  font-family: 'Inter', sans-serif;
  color: #1E293B;
}

.main-content {
  padding: 32px;
  transition: all 0.3s ease;
}

.welcome-banner {
  background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  border-radius: 24px;
  padding: 40px 48px;
  color: white;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 
    0 20px 40px rgba(37, 99, 235, 0.2),
    0 8px 16px rgba(37, 99, 235, 0.1);
}

.welcome-text h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.welcome-text p {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 400;
}

.welcome-actions {
  display: flex;
  gap: 16px;
}

.primary-button,
.secondary-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.primary-button {
  background: white;
  color: #2563EB;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.primary-button:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.primary-button svg,
.secondary-button svg {
  width: 20px;
  height: 20px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.04),
    0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-info h3 {
  font-size: 32px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-info p {
  font-size: 14px;
  color: #64748B;
  font-weight: 500;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.12),
    0 12px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border-color: rgba(59, 130, 246, 0.3);
}

.glass-card:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.feature-card {
  /* glass styles inherited from .glass-card */
  padding: 32px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
}



.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563EB;
}

.card-icon svg {
  width: 32px;
  height: 32px;
  color: currentColor;
}

.card-content h4 {
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.card-content p {
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
}

.card-count,
.card-status {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.card-count {
  color: #2563EB;
}

.status-success {
  color: #10B981;
}

.status-info {
  color: #3B82F6;
}

.card-hint {
  font-size: 14px;
  color: #64748B;
  margin-top: 8px;
}

.card-action {
  margin-top: auto;
}

.card-button {
  padding: 8px 20px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563EB;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-button:hover {
  background: rgba(37, 99, 235, 0.2);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .main-content {
    padding: 24px;
  }
  
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .welcome-banner {
    padding: 32px;
  }
  
  .welcome-text h2 {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 24px;
  }
  
  .welcome-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .feature-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 16px;
  }
  
  .welcome-text h2 {
    font-size: 24px;
  }
  
  .stat-info h3 {
    font-size: 28px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .dashboard,
  .main-content,
  .stat-card,
  .feature-card,
  .primary-button,
  .secondary-button,
  .card-button {
    transition: none;
  }
  
  .stat-card:hover,
  .feature-card:hover {
    transform: none;
  }
}

/* Focus styles for keyboard navigation */
.feature-card:focus,
.stat-card:focus,
.primary-button:focus,
.secondary-button:focus,
.card-button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
</style>