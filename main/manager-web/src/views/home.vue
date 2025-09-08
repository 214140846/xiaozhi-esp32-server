<template>
  <div class="welcome">
    <!-- 公共头部 -->
    <HeaderBar :devices="devices" @search="handleSearch" @search-reset="handleSearchReset" />
    <el-main style="padding: 20px;display: flex;flex-direction: column;">
      <div>
        <!-- 首页内容 -->
        <div class="dashboard-banner">
          <div class="banner-bg">
            <!-- 左侧：智能问候与系统概览 -->
            <div class="banner-left">
              <div class="greeting-section">
                <div class="greeting-text">
                  {{ currentGreeting }}
                </div>
                <div class="greeting-subtitle">
                  {{ currentDatetime }}
                </div>
              </div>
              
              <div class="stats-section">
                <div class="stat-item">
                  <div class="stat-number">{{ totalAgents }}</div>
                  <div class="stat-label">智能体总数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-number">{{ activeAgents }}</div>
                  <div class="stat-label">近期活跃</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-number">{{ totalDevices }}</div>
                  <div class="stat-label">连接设备</div>
                </div>
              </div>
            </div>
            
            <!-- 中间：快捷操作 -->
            <div class="banner-center">
              <div class="quick-actions">
                <div class="action-btn primary" @click="showAddDialog">
                  <i class="el-icon-plus"></i>
                  <span>添加智能体</span>
                </div>
                <div class="action-btn" @click="goToDeviceManagement">
                  <i class="el-icon-monitor"></i>
                  <span>设备管理</span>
                </div>
                <div class="action-btn" @click="refreshData">
                  <i class="el-icon-refresh" :class="{rotating: isRefreshing}"></i>
                  <span>刷新数据</span>
                </div>
              </div>
            </div>
            
            <!-- 右侧：系统状态 -->
            <div class="banner-right">
              <div class="system-status">
                <div class="status-item">
                  <div class="status-indicator online"></div>
                  <div class="status-text">
                    <div class="status-title">系统在线</div>
                    <div class="status-desc">运行正常</div>
                  </div>
                </div>
                
                <div class="last-activity" v-if="lastActiveAgent">
                  <div class="activity-label">最近活跃</div>
                  <div class="activity-info">
                    <span class="agent-name">{{ lastActiveAgent.name }}</span>
                    <span class="activity-time">{{ lastActiveAgent.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="device-list-container">
          <template v-if="isLoading">
            <div v-for="i in skeletonCount" :key="'skeleton-' + i" class="skeleton-item">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line-short"></div>
              </div>
            </div>
          </template>

          <template v-else>
            <DeviceItem v-for="(item, index) in devices" :key="index" :device="item" @configure="goToRoleConfig"
              @deviceManage="handleDeviceManage" @delete="handleDeleteAgent" @chat-history="handleShowChatHistory" />
          </template>
        </div>
      </div>
      <AddWisdomBodyDialog :visible.sync="addDeviceDialogVisible" @confirm="handleWisdomBodyAdded" />
    </el-main>
    <el-footer>
      <version-footer />
    </el-footer>
    <chat-history-dialog :visible.sync="showChatHistory" :agent-id="currentAgentId" :agent-name="currentAgentName" />
  </div>

</template>

<script>
import Api from '@/apis/api';
import AddWisdomBodyDialog from '@/components/AddWisdomBodyDialog.vue';
import ChatHistoryDialog from '@/components/ChatHistoryDialog.vue';
import DeviceItem from '@/components/DeviceItem.vue';
import HeaderBar from '@/components/HeaderBar.vue';
import VersionFooter from '@/components/VersionFooter.vue';

export default {
  name: 'HomePage',
  components: { DeviceItem, AddWisdomBodyDialog, HeaderBar, VersionFooter, ChatHistoryDialog },
  data() {
    return {
      addDeviceDialogVisible: false,
      devices: [],
      originalDevices: [],
      isSearching: false,
      searchRegex: null,
      isLoading: true,
      skeletonCount: localStorage.getItem('skeletonCount') || 8,
      showChatHistory: false,
      currentAgentId: '',
      currentAgentName: '',
      isRefreshing: false,
      currentTime: new Date()
    }
  },

  computed: {
    // 智能问候
    currentGreeting() {
      const hour = this.currentTime.getHours();
      if (hour >= 5 && hour < 12) {
        return '早上好';
      } else if (hour >= 12 && hour < 18) {
        return '下午好';
      } else if (hour >= 18 && hour < 24) {
        return '晚上好';
      } else {
        return '深夜好';
      }
    },
    
    // 当前日期时间
    currentDatetime() {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      };
      return this.currentTime.toLocaleDateString('zh-CN', options);
    },
    
    // 智能体总数
    totalAgents() {
      return this.originalDevices.length;
    },
    
    // 近期活跃的智能体数量（最近24小时内有对话）
    activeAgents() {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return this.originalDevices.filter(device => {
        if (!device.lastConnectedAt) return false;
        return new Date(device.lastConnectedAt) > oneDayAgo;
      }).length;
    },
    
    // 设备总数
    totalDevices() {
      return this.originalDevices.reduce((total, device) => {
        return total + (device.deviceCount || 0);
      }, 0);
    },
    
    // 最近活跃的智能体
    lastActiveAgent() {
      if (this.originalDevices.length === 0) return null;
      
      const sortedDevices = [...this.originalDevices]
        .filter(device => device.lastConnectedAt)
        .sort((a, b) => new Date(b.lastConnectedAt) - new Date(a.lastConnectedAt));
      
      if (sortedDevices.length === 0) return null;
      
      const lastDevice = sortedDevices[0];
      const lastTime = new Date(lastDevice.lastConnectedAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
      
      let timeString;
      if (diffMinutes <= 1) {
        timeString = '刚刚';
      } else if (diffMinutes < 60) {
        timeString = `${diffMinutes}分钟前`;
      } else if (diffMinutes < 24 * 60) {
        const hours = Math.floor(diffMinutes / 60);
        timeString = `${hours}小时前`;
      } else {
        timeString = '超过24小时';
      }
      
      return {
        name: lastDevice.agentName,
        time: timeString
      };
    }
  },
  
  mounted() {
    this.fetchAgentList();
    // 每分钟更新时间
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  },
  
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },

  methods: {
    showAddDialog() {
      this.addDeviceDialogVisible = true
    },
    goToRoleConfig() {
      // 点击配置角色后跳转到角色配置页
      this.$router.push('/role-config')
    },
    handleWisdomBodyAdded(res) {
      this.fetchAgentList();
      this.addDeviceDialogVisible = false;
    },
    handleDeviceManage() {
      this.$router.push('/device-management');
    },
    handleSearch(regex) {
      this.isSearching = true;
      this.searchRegex = regex;
      this.applySearchFilter();
    },
    handleSearchReset() {
      this.isSearching = false;
      this.searchRegex = null;
      this.devices = [...this.originalDevices];
    },
    applySearchFilter() {
      if (!this.isSearching || !this.searchRegex) {
        this.devices = [...this.originalDevices];
        return;
      }

      this.devices = this.originalDevices.filter(device => {
        return this.searchRegex.test(device.agentName);
      });
    },
    // 搜索更新智能体列表
    handleSearchResult(filteredList) {
      this.devices = filteredList; // 更新设备列表
    },
    // 获取智能体列表
    fetchAgentList() {
      this.isLoading = true;
      Api.agent.getAgentList(({ data }) => {
        if (data?.data) {
          this.originalDevices = data.data.map(item => ({
            ...item,
            agentId: item.id
          }));

          // 动态设置骨架屏数量（可选）
          this.skeletonCount = Math.min(
            Math.max(this.originalDevices.length, 3), // 最少3个
            10 // 最多10个
          );

          this.handleSearchReset();
        }
        this.isLoading = false;
      }, (error) => {
        console.error('Failed to fetch agent list:', error);
        this.isLoading = false;
      });
    },
    // 删除智能体
    handleDeleteAgent(agentId) {
      this.$confirm('确定要删除该智能体吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        Api.agent.deleteAgent(agentId, (res) => {
          if (res.data.code === 0) {
            this.$message.success({
              message: '删除成功',
              showClose: true
            });
            this.fetchAgentList(); // 刷新列表
          } else {
            this.$message.error({
              message: res.data.msg || '删除失败',
              showClose: true
            });
          }
        });
      }).catch(() => { });
    },
    handleShowChatHistory({ agentId, agentName }) {
      this.currentAgentId = agentId;
      this.currentAgentName = agentName;
      this.showChatHistory = true;
    },
    
    // 设备管理快捷操作
    goToDeviceManagement() {
      this.$router.push('/device-management');
    },
    
    // 刷新数据
    refreshData() {
      this.isRefreshing = true;
      this.fetchAgentList();
      
      // 显示动画效果
      setTimeout(() => {
        this.isRefreshing = false;
        this.$message.success({
          message: '数据刷新成功',
          showClose: true,
          duration: 2000
        });
      }, 1000);
    }
  }
}
</script>

<style scoped>
.welcome {
  min-width: 900px;
  min-height: 506px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
  /* 透明背景以显示Aurora动画背景 */
}

/* 新的dashboard banner样式 */
.dashboard-banner {
  height: 200px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  /* 透明玻璃效果 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 
              0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.banner-bg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  padding: 24px 30px;
  box-sizing: border-box;
  /* 移除背景图片，使用纯透明玻璃效果 */
}

/* 左侧：问候与统计 */
.banner-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.greeting-section {
  margin-bottom: 20px;
}

.greeting-text {
  color: #FFFFFF;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.greeting-subtitle {
  color: #E2E8F0;
  font-size: 14px;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.stats-section {
  display: flex;
  gap: 20px;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  color: #C966FF;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-label {
  color: #CBD5E1;
  font-size: 12px;
  font-weight: 400;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(201, 102, 255, 0.3);
}

/* 中间：快捷操作 */
.banner-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #F8FAFC;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-width: 120px;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(201, 102, 255, 0.2);
  border-color: rgba(201, 102, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(201, 102, 255, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, #C966FF, #B347E8);
  border-color: #C966FF;
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #D985FF, #C966FF);
  box-shadow: 0 6px 20px rgba(201, 102, 255, 0.4);
}

.action-btn i {
  font-size: 16px;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.rotating {
  animation: rotating 1s linear infinite;
}

/* 右侧：系统状态 */
.banner-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.system-status {
  text-align: right;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
}

.status-indicator.online {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); }
  100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
}

.status-text {
  text-align: left;
}

.status-title {
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.status-desc {
  color: #CBD5E1;
  font-size: 12px;
  margin-top: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.last-activity {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  min-width: 160px;
}

.activity-label {
  color: #CBD5E1;
  font-size: 12px;
  margin-bottom: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agent-name {
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.activity-time {
  color: #C966FF;
  font-size: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.device-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px;
  padding: 30px 0;
  position: relative;
  z-index: 10;
}

/* 在 DeviceItem.vue 的样式中 */
.device-item {
  margin: 0 !important;
  /* 避免冲突 */
  width: auto !important;
}

.footer {
  font-size: 12px;
  font-weight: 400;
  margin-top: auto;
  padding-top: 30px;
  color: #979db1;
  text-align: center;
  /* 居中显示 */
}

/* 骨架屏动画 */
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-item {
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  height: 120px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(201, 102, 255, 0.1);
}

.skeleton-image {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  float: left;
  position: relative;
  overflow: hidden;
}

.skeleton-content {
  margin-left: 100px;
}

.skeleton-line {
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 12px;
  width: 70%;
  position: relative;
  overflow: hidden;
}

.skeleton-line-short {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  width: 50%;
}

.skeleton-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg,
      rgba(201, 102, 255, 0),
      rgba(201, 102, 255, 0.3),
      rgba(201, 102, 255, 0));
  animation: shimmer 1.5s infinite;
}
</style>