<template>
  <div id="app">
    <template v-if="$route.name === 'Login'">
      <router-view />
    </template>
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

export default {
  name: 'App',
  components: {
    Sidebar,
    Header
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
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-grayscale: grayscale;
}

.app-main {
  margin-left: 280px; /* Sidebar width */
  padding-top: 80px; /* Header height */
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .app-main {
    margin-left: 260px;
  }
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 240px;
  }
}

@media (max-width: 480px) {
  .app-main {
    margin-left: 200px;
  }
}
</style>
