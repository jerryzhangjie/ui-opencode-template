<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1>人力资源看板</h1>
        <p>实时掌握企业人力资源状况</p>
      </div>
      <div class="header-right">
        <span class="last-update">最后更新：{{ lastUpdateTime }}</span>
        <button class="refresh-btn" @click="refreshData" :disabled="refreshing">
          <svg :class="{ spinning: refreshing }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd" />
          </svg>
          <span>{{ refreshing ? '刷新中...' : '刷新数据' }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="(kpi, index) in kpiData" :key="kpi.label" :style="{ animationDelay: `${index * 100}ms` }">
        <div class="kpi-icon" :style="{ background: kpi.iconBg }">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" :style="{ color: kpi.iconColor }">
            <path :d="kpi.icon" />
          </svg>
        </div>
        <div class="kpi-content">
          <span class="kpi-label">{{ kpi.label }}</span>
          <span class="kpi-value" :style="{ color: kpi.valueColor }">{{ kpi.value }}</span>
          <div class="kpi-trend" :class="kpi.trendType">
            <svg v-if="kpi.trendType === 'up'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="kpi.trendType === 'down'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M12 20.25a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H12.75v-6.75a.75.75 0 011.5 0v6.75a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-6.75a.75.75 0 00-1.5 0v6.75h-.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
            </svg>
            <span>{{ kpi.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <!-- Department Distribution - Pie Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>部门人员分布</h3>
        </div>
        <div class="chart-body" ref="deptChart"></div>
      </div>

      <!-- Personnel Flow Trend - Line Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>人员流动趋势</h3>
          <div class="time-selector">
            <button 
              v-for="period in timePeriods" 
              :key="period.value"
              :class="{ active: selectedPeriod === period.value }"
              @click="changePeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="chart-body" ref="flowChart"></div>
      </div>

      <!-- Position Distribution - Donut Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>岗位类型分布</h3>
        </div>
        <div class="chart-body" ref="positionChart"></div>
      </div>

      <!-- Age Structure - Bar Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>年龄结构分析</h3>
        </div>
        <div class="chart-body" ref="ageChart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getCurrentUser } from '@/utils/auth'

export default {
  name: 'Dashboard',
  data() {
    return {
      username: '',
      lastUpdateTime: '',
      refreshing: false,
      selectedPeriod: 'month',
      timePeriods: [
        { label: '近一周', value: 'week' },
        { label: '近一月', value: 'month' },
        { label: '近三月', value: 'quarter' },
        { label: '近一年', value: 'year' }
      ],
      kpiData: [
        {
          label: '员工总数',
          value: '1,286',
          trend: '较上季度 +3.2%',
          trendType: 'up',
          icon: 'M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z',
          iconBg: 'rgba(30, 58, 138, 0.1)',
          iconColor: '#1E3A8A',
          valueColor: '#0F172A'
        },
        {
          label: '本月入职',
          value: '42',
          trend: '较上月 +12',
          trendType: 'up',
          icon: 'M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z',
          iconBg: 'rgba(22, 163, 74, 0.1)',
          iconColor: '#16A34A',
          valueColor: '#16A34A'
        },
        {
          label: '本月离职',
          value: '18',
          trend: '较上月 -5',
          trendType: 'down',
          icon: 'M12 20.25a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H12.75v-6.75a.75.75 0 011.5 0v6.75a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75v-6.75a.75.75 0 00-1.5 0v6.75h-.75a.75.75 0 01-.75-.75z',
          iconBg: 'rgba(220, 38, 38, 0.1)',
          iconColor: '#DC2626',
          valueColor: '#DC2626'
        },
        {
          label: '在编率',
          value: '96.8%',
          trend: '目标 ≥95%',
          trendType: 'up',
          icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
          iconBg: 'rgba(202, 138, 4, 0.1)',
          iconColor: '#CA8A04',
          valueColor: '#1E3A8A'
        }
      ],
      // Chart instances
      deptChart: null,
      flowChart: null,
      positionChart: null,
      ageChart: null,
      // Chart data
      deptData: [
        { name: '总行营业部', value: 286 },
        { name: '科技支行', value: 198 },
        { name: '城西支行', value: 165 },
        { name: '城东支行', value: 152 },
        { name: '滨汇支行', value: 138 }
      ],
      flowData: {
        week: { hired: [5, 8, 6, 12, 7, 9, 4], resigned: [2, 3, 1, 4, 2, 3, 1] },
        month: { hired: [12, 18, 15, 22, 16, 20, 14], resigned: [8, 6, 10, 5, 8, 7, 6] },
        quarter: { hired: [45, 52, 48], resigned: [28, 32, 25] },
        year: { hired: [186, 210, 195, 168], resigned: [120, 98, 110, 85] }
      },
      positionData: [
        { name: '柜员', value: 386 },
        { name: '客户经理', value: 285 },
        { name: '管理人员', value: 156 },
        { name: '技术人员', value: 198 },
        { name: '其他', value: 261 }
      ],
      ageData: [
        { name: '20岁以下', value: 28 },
        { name: '20-30岁', value: 386 },
        { name: '30-40岁', value: 425 },
        { name: '40-50岁', value: 298 },
        { name: '50岁以上', value: 149 }
      ]
    }
  },
  mounted() {
    const user = getCurrentUser()
    this.username = user ? user.name : '管理员'
    this.updateTime()
    this.initCharts()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
    this.disposeCharts()
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.lastUpdateTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    },
    startAutoRefresh() {
      this.timer = setInterval(() => {
        this.updateTime()
      }, 1000)
    },
    stopAutoRefresh() {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    refreshData() {
      if (this.refreshing) return
      this.refreshing = true
      setTimeout(() => {
        this.refreshing = false
        this.updateTime()
      }, 1500)
    },
    changePeriod(period) {
      this.selectedPeriod = period
      this.updateFlowChart()
    },
    initCharts() {
      this.initDeptChart()
      this.initFlowChart()
      this.initPositionChart()
      this.initAgeChart()
    },
    disposeCharts() {
      this.deptChart?.dispose()
      this.flowChart?.dispose()
      this.positionChart?.dispose()
      this.ageChart?.dispose()
    },
    
    // Department Pie Chart
    initDeptChart() {
      this.deptChart = echarts.init(this.$refs.deptChart)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)',
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          textStyle: { color: '#0F172A' }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: '#64748B', fontSize: 12 }
        },
        series: [{
          name: '部门人数',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: { show: false },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          labelLine: { show: false },
          data: this.deptData,
          color: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
        }]
      }
      this.deptChart.setOption(option)
    },
    
    // Flow Line Chart
    initFlowChart() {
      this.flowChart = echarts.init(this.$refs.flowChart)
      this.updateFlowChart()
    },
    updateFlowChart() {
      const data = this.flowData[this.selectedPeriod]
      const xLabels = this.selectedPeriod === 'week' 
        ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        : this.selectedPeriod === 'month'
        ? ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周']
        : this.selectedPeriod === 'quarter'
        ? ['1月', '2月', '3月']
        : ['Q1', 'Q2', 'Q3', 'Q4']
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          textStyle: { color: '#0F172A' }
        },
        legend: {
          data: ['入职', '离职'],
          top: 0,
          textStyle: { color: '#64748B', fontSize: 12 }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xLabels,
          axisLine: { lineStyle: { color: '#E2E8F0' } },
          axisLabel: { color: '#64748B', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
          axisLabel: { color: '#64748B', fontSize: 12 }
        },
        series: [
          {
            name: '入职',
            type: 'line',
            data: data.hired,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#16A34A', width: 3 },
            itemStyle: { color: '#16A34A' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(22, 163, 74, 0.3)' },
                  { offset: 1, color: 'rgba(22, 163, 74, 0.05)' }
                ]
              }
            }
          },
          {
            name: '离职',
            type: 'line',
            data: data.resigned,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#DC2626', width: 3 },
            itemStyle: { color: '#DC2626' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(220, 38, 38, 0.3)' },
                  { offset: 1, color: 'rgba(220, 38, 38, 0.05)' }
                ]
              }
            }
          }
        ]
      }
      this.flowChart.setOption(option)
    },
    
    // Position Donut Chart
    initPositionChart() {
      this.positionChart = echarts.init(this.$refs.positionChart)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)',
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          textStyle: { color: '#0F172A' }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: '#64748B', fontSize: 12 }
        },
        series: [{
          name: '岗位类型',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#FFFFFF',
            borderWidth: 2
          },
          label: { show: false },
          data: this.positionData,
          color: ['#CA8A04', '#EAB308', '#FCD34D', '#FDE68A', '#FEF3C7']
        }]
      }
      this.positionChart.setOption(option)
    },
    
    // Age Bar Chart
    initAgeChart() {
      this.ageChart = echarts.init(this.$refs.ageChart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          textStyle: { color: '#0F172A' }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
          axisLabel: { color: '#64748B', fontSize: 12 }
        },
        yAxis: {
          type: 'category',
          data: this.ageData.map(item => item.name),
          axisLine: { lineStyle: { color: '#E2E8F0' } },
          axisLabel: { color: '#64748B', fontSize: 12 }
        },
        series: [{
          name: '人数',
          type: 'bar',
          data: this.ageData.map(item => item.value),
          barWidth: '50%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#0F172A' },
                { offset: 1, color: '#475569' }
              ]
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#64748B',
            fontSize: 12
          }
        }]
      }
      this.ageChart.setOption(option)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

.dashboard {
  min-height: calc(100vh - 80px);
  background: #F8FAFC;
  font-family: 'IBM Plex Sans', sans-serif;
  padding: 24px 32px;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
}

.header-left p {
  font-size: 14px;
  color: #64748B;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.last-update {
  font-size: 13px;
  color: #64748B;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  color: #0F172A;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #1E3A8A;
  color: #1E3A8A;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn svg {
  width: 16px;
  height: 16px;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.kpi-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon svg {
  width: 24px;
  height: 24px;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.kpi-trend.up {
  color: #16A34A;
}

.kpi-trend.down {
  color: #DC2626;
}

.kpi-trend svg {
  width: 14px;
  height: 14px;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.time-selector {
  display: flex;
  gap: 4px;
  background: #F1F5F9;
  padding: 4px;
  border-radius: 8px;
}

.time-selector button {
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-selector button:hover {
  color: #0F172A;
}

.time-selector button.active {
  background: #FFFFFF;
  color: #0F172A;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chart-body {
  height: 320px;
  padding: 16px;
}

/* Responsive */
@media (max-width: 1280px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .dashboard {
    padding: 20px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  
  .kpi-card {
    padding: 20px;
  }
  
  .kpi-value {
    font-size: 24px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-body {
    height: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kpi-card,
  .refresh-btn svg.spinning {
    animation: none;
    transition: none;
  }
  
  .kpi-card:hover {
    transform: none;
  }
}
</style>
