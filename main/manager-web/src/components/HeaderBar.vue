<template>
  <el-header class="header">
    <div class="header-container">
      <!-- 左侧元素 -->
      <div class="header-left" @click="goHome">
        
      </div>

      <!-- 中间导航菜单 -->
      <div class="header-center">
        <div class="equipment-management"
          :class="{ 'active-tab': $route.path === '/home' || $route.path === '/role-config' || $route.path === '/device-management' }"
          @click="goHome">
          <user-icon size="18" :color="$route.path === '/home' || $route.path === '/role-config' || $route.path === '/device-management' ? '#ffffff' : '#CBD5E1'" />
          智能体管理
        </div>
        <div v-if="isSuperAdmin" class="equipment-management" :class="{ 'active-tab': $route.path === '/model-config' }"
          @click="goModelConfig">
          <settings-icon size="18" :color="$route.path === '/model-config' ? '#ffffff' : '#CBD5E1'" />
          模型配置
        </div>
        <div v-if="isSuperAdmin" class="equipment-management"
          :class="{ 'active-tab': $route.path === '/user-management' }" @click="goUserManagement">
          <users-icon size="18" :color="$route.path === '/user-management' ? '#ffffff' : '#CBD5E1'" />
          用户管理
        </div>
        <div v-if="isSuperAdmin" class="equipment-management"
          :class="{ 'active-tab': $route.path === '/ota-management' }" @click="goOtaManagement">
          <refresh-cw-icon size="18" :color="$route.path === '/ota-management' ? '#ffffff' : '#CBD5E1'" />
          OTA管理
        </div>
        <el-dropdown v-if="isSuperAdmin" trigger="click" class="equipment-management more-dropdown"
          :class="{ 'active-tab': $route.path === '/dict-management' || $route.path === '/params-management' || $route.path === '/provider-management' || $route.path === '/server-side-management' }"
          @visible-change="handleParamDropdownVisibleChange">
          <span class="el-dropdown-link">
            <database-icon size="18" :color="$route.path === '/dict-management' || $route.path === '/params-management' || $route.path === '/provider-management' || $route.path === '/server-side-management' ? '#ffffff' : '#CBD5E1'" />
            参数字典
            <i class="el-icon-arrow-down el-icon--right" :class="{ 'rotate-down': paramDropdownVisible }"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="goParamManagement">
              参数管理
            </el-dropdown-item>
            <el-dropdown-item @click.native="goDictManagement">
              字典管理
            </el-dropdown-item>
            <el-dropdown-item @click.native="goProviderManagement">
              字段管理
            </el-dropdown-item>
            <el-dropdown-item @click.native="goServerSideManagement">
              服务端管理
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <!-- 右侧元素 -->
      <div class="header-right">
        <div class="search-container" v-if="$route.path === '/home' && !(isSuperAdmin && isSmallScreen)">
          <el-input v-model="search" placeholder="输入名称搜索.." class="custom-search-input"
            @keyup.enter.native="handleSearch">
            <i slot="suffix" class="el-icon-search search-icon" @click="handleSearch"></i>
          </el-input>
        </div>
        <user-icon size="24" color="#CBD5E1" class="avatar-img" />
        <el-dropdown trigger="click" class="user-dropdown" @visible-change="handleUserDropdownVisibleChange">
          <span class="el-dropdown-link">
            {{ userInfo.username || '加载中...' }}
            <i class="el-icon-arrow-down el-icon--right" :class="{ 'rotate-down': userDropdownVisible }"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="showChangePasswordDialog">修改密码</el-dropdown-item>
            <el-dropdown-item @click.native="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <ChangePasswordDialog v-model="isChangePasswordDialogVisible" />
  </el-header>
</template>

<script>
import userApi from '@/apis/module/user';
import { mapActions, mapGetters } from 'vuex';
import ChangePasswordDialog from './ChangePasswordDialog.vue'; // 引入修改密码弹窗组件
import { UserIcon, SettingsIcon, UsersIcon, RefreshCcwIcon, DatabaseIcon } from 'vue-feather-icons'

export default {
  name: 'HeaderBar',
  components: {
    ChangePasswordDialog,
    UserIcon,
    SettingsIcon,
    UsersIcon,
    RefreshCcwIcon,
    DatabaseIcon
  },
  props: ['devices'],  // 接收父组件设备列表
  data() {
    return {
      search: '',
      userInfo: {
        username: '',
        mobile: ''
      },
      isChangePasswordDialogVisible: false, // 控制修改密码弹窗的显示
      userDropdownVisible: false,
      paramDropdownVisible: false,
      isSmallScreen: false
    }
  },
  computed: {
    ...mapGetters(['getIsSuperAdmin']),
    isSuperAdmin() {
      return this.getIsSuperAdmin;
    }
  },
  mounted() {
    this.fetchUserInfo();
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  //移除事件监听器
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    goHome() {
      // 跳转到首页
      this.$router.push('/home')
    },
    goUserManagement() {
      this.$router.push('/user-management')
    },
    goModelConfig() {
      this.$router.push('/model-config')
    },
    goParamManagement() {
      this.$router.push('/params-management')
    },
    goOtaManagement() {
      this.$router.push('/ota-management')
    },
    goDictManagement() {
      this.$router.push('/dict-management')
    },
    goProviderManagement() {
      this.$router.push('/provider-management')
    },
    goServerSideManagement() {
      this.$router.push('/server-side-management')
    },
    // 获取用户信息
    fetchUserInfo() {
      userApi.getUserInfo(({ data }) => {
        this.userInfo = data.data
        if (data.data.superAdmin !== undefined) {
          this.$store.commit('setUserInfo', data.data);
        }
      })
    },
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth <= 1386;
    },
    // 处理搜索
    handleSearch() {
      const searchValue = this.search.trim();

      // 如果搜索内容为空，触发重置事件
      if (!searchValue) {
        this.$emit('search-reset');
        return;
      }

      try {
        // 创建不区分大小写的正则表达式
        const regex = new RegExp(searchValue, 'i');
        // 触发搜索事件，将正则表达式传递给父组件
        this.$emit('search', regex);
      } catch (error) {
        console.error('正则表达式创建失败:', error);
        this.$message.error({
          message: '搜索关键词格式不正确',
          showClose: true
        });
      }
    },
    // 显示修改密码弹窗
    showChangePasswordDialog() {
      this.isChangePasswordDialogVisible = true;
    },
    // 退出登录
    async handleLogout() {
      try {
        // 调用 Vuex 的 logout action
        await this.logout();
        this.$message.success({
          message: '退出登录成功',
          showClose: true
        });
      } catch (error) {
        console.error('退出登录失败:', error);
        this.$message.error({
          message: '退出登录失败，请重试',
          showClose: true
        });
      }
    },
    handleUserDropdownVisibleChange(visible) {
      this.userDropdownVisible = visible;
    },
    // 监听第二个下拉菜单的可见状态变化
    handleParamDropdownVisibleChange(visible) {
      this.paramDropdownVisible = visible;
    },

    // 使用 mapActions 引入 Vuex 的 logout action
    ...mapActions(['logout'])
  }
}
</script>

<style lang="scss" scoped>
.header {
  background: rgba(26, 26, 46, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(201, 102, 255, 0.1);
  height: 63px !important;
  min-width: 900px;
  /* 设置最小宽度防止过度压缩 */
  overflow: hidden;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 120px;
}

.logo-img {
  width: 42px;
  height: 42px;
}

.brand-img {
  height: 20px;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 25px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 300px;
  justify-content: flex-end;
}

.equipment-management {
  height: 30px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 102, 255, 0.2);
  display: flex;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  gap: 7px;
  color: #CBD5E1;
  margin-left: 1px;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  /* 防止导航按钮被压缩 */
  padding: 0 15px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.equipment-management:hover {
  background: rgba(201, 102, 255, 0.15);
  border-color: rgba(201, 102, 255, 0.4);
  color: #F8FAFC;
  box-shadow: 0 4px 15px rgba(201, 102, 255, 0.2);
  transform: translateY(-1px);
}

.equipment-management.active-tab {
  background: linear-gradient(135deg, #C966FF, #B347E8) !important;
  color: #fff !important;
  border-color: rgba(201, 102, 255, 0.5) !important;
  box-shadow: 0 4px 15px rgba(201, 102, 255, 0.3), 0 0 10px rgba(201, 102, 255, 0.2) !important;
}

.equipment-management img {
  width: 15px;
  height: 13px;
}

.search-container {
  margin-right: 15px;
  min-width: 150px;
  flex-grow: 1;
  max-width: 220px;
}

.custom-search-input>>>.el-input__inner {
  height: 30px;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 102, 255, 0.3) !important;
  padding-left: 15px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  color: #F8FAFC !important;
}

.custom-search-input>>>.el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
}

.custom-search-input>>>.el-input__inner:focus {
  border-color: #C966FF !important;
  box-shadow: 0 0 10px rgba(201, 102, 255, 0.3) !important;
}

.search-icon {
  cursor: pointer;
  color: #C966FF;
  margin-right: 8px;
  font-size: 14px;
  line-height: 30px;
  transition: color 0.3s ease;
}

.search-icon:hover {
  color: #D985FF;
}

.custom-search-input::v-deep .el-input__suffix-inner {
  display: flex;
  align-items: center;
  height: 100%;
}

.avatar-img {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
}

.user-dropdown {
  flex-shrink: 0;
}

.more-dropdown {
  padding-right: 20px;
}

.more-dropdown .el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 7px;
}

.rotate-down {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.el-icon-arrow-down {
  transition: transform 0.3s ease;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .header-center {
    gap: 14px;
  }

  .equipment-management {
    width: 79px;
    font-size: 9px;
  }
}

.equipment-management.more-dropdown {
  position: relative;
}

.equipment-management.more-dropdown .el-dropdown-menu {
  position: absolute;
  right: 0;
  min-width: 120px;
  margin-top: 5px;
}

.el-dropdown-menu__item {
  min-width: 60px;
  padding: 8px 20px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}
</style>