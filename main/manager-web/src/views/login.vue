<template>
  <div class="ironman-login-container">
    <!-- 科技粒子背景 -->
    <TechParticles 
      :particle-count="60"
      :mouse-interaction="true"
      :animation-speed="0.8"
      :enable-connections="true"
    />
    
    <!-- 主容器 -->
    <div class="login-main-container">
      <!-- 顶部品牌区域 -->
      <div class="brand-header">
        <div class="brand-logo">
          <img loading="lazy" alt="XiaoZhi AI" src="@/assets/xiaozhi-logo.png" class="logo-image" />
          <img loading="lazy" alt="XiaoZhi AI" src="@/assets/xiaozhi-ai.png" class="brand-text" />
        </div>
        
        <!-- HUD 状态指示器 -->
        <div class="hud-status">
          <div class="status-item">
            <div class="status-dot active"></div>
            <span>SYSTEM ONLINE</span>
          </div>
          <div class="status-item">
            <div class="status-dot"></div>
            <span>AUTH READY</span>
          </div>
        </div>
      </div>
      
      <!-- 左侧装饰面板 -->
      <div class="left-decoration-panel">
        <div class="armor-frame">
          <div class="frame-corner frame-tl"></div>
          <div class="frame-corner frame-tr"></div>
          <div class="frame-corner frame-bl"></div>
          <div class="frame-corner frame-br"></div>
          
          <!-- 能量核心动画 -->
          <div class="energy-core">
            <div class="core-ring core-ring-1"></div>
            <div class="core-ring core-ring-2"></div>
            <div class="core-ring core-ring-3"></div>
            <div class="core-center"></div>
          </div>
          
          <!-- 系统信息显示 -->
          <div class="system-info">
            <div class="info-line">
              <span class="label">USER ACCESS:</span>
              <span class="value">AUTHORIZED</span>
            </div>
            <div class="info-line">
              <span class="label">SECURITY:</span>
              <span class="value">ACTIVE</span>
            </div>
            <div class="info-line">
              <span class="label">VERSION:</span>
              <span class="value">MARK-85</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录面板 -->
      <div class="login-panel">
        <div class="glass-card login-card" @keyup.enter="login">
          <!-- 登录标题 -->
          <div class="login-header">
            <div class="header-decoration">
              <div class="deco-line"></div>
              <div class="deco-dot"></div>
            </div>
            <h2 class="login-title">ACCESS CONTROL</h2>
            <p class="login-subtitle">ENTER YOUR CREDENTIALS</p>
            <div class="header-decoration reverse">
              <div class="deco-dot"></div>
              <div class="deco-line"></div>
            </div>
          </div>
          
          <!-- 登录表单 -->
          <div class="login-form">
            <!-- 用户名登录 -->
            <template v-if="!isMobileLogin">
              <IronInput
                v-model="form.username"
                placeholder="Enter Username"
                prefix-icon="user"
                :error-message="usernameError"
                help-text="Enter your system username"
                required
              />
            </template>

            <!-- 手机号登录 -->
            <template v-else>
              <div class="mobile-input-group">
                <div class="area-code-select">
                  <el-select 
                    v-model="form.areaCode" 
                    class="iron-select"
                    placeholder="Code"
                  >
                    <el-option 
                      v-for="item in mobileAreaList" 
                      :key="item.key" 
                      :label="`${item.name} (${item.key})`"
                      :value="item.key" 
                    />
                  </el-select>
                </div>
                <IronInput
                  v-model="form.mobile"
                  placeholder="Enter Mobile Number"
                  prefix-icon="mobile-phone"
                  :error-message="mobileError"
                  help-text="Enter your mobile phone number"
                  required
                  class="mobile-input"
                />
              </div>
            </template>

            <!-- 密码输入 -->
            <IronInput
              v-model="form.password"
              type="password"
              placeholder="Enter Password"
              prefix-icon="lock"
              :show-password="true"
              :error-message="passwordError"
              help-text="Enter your secure password"
              required
            />
            
            <!-- 验证码输入 -->
            <div class="captcha-group">
              <IronInput
                v-model="form.captcha"
                placeholder="Verification Code"
                prefix-icon="view"
                :error-message="captchaError"
                help-text="Enter the security code"
                required
                class="captcha-input"
              />
              <div class="captcha-image-container" @click="fetchCaptcha">
                <img 
                  v-if="captchaUrl" 
                  :src="captchaUrl" 
                  alt="Captcha"
                  class="captcha-image"
                />
                <div class="captcha-refresh">
                  <i class="el-icon-refresh"></i>
                </div>
              </div>
            </div>
            
            <!-- 功能链接 -->
            <div class="function-links">
              <GlowButton
                v-if="allowUserRegister"
                type="ghost"
                size="small"
                @click="goToRegister"
                class="link-button"
              >
                NEW USER REGISTER
              </GlowButton>
              <GlowButton
                v-if="enableMobileRegister"
                type="ghost"
                size="small"
                @click="goToForgetPassword"
                class="link-button"
              >
                FORGOT PASSWORD?
              </GlowButton>
            </div>
          </div>
          
          <!-- 登录按钮 -->
          <div class="login-actions">
            <GlowButton
              type="primary"
              size="large"
              :loading="loginLoading"
              :scanning="loginScanning"
              block
              @click="login"
              class="main-login-button"
            >
              <template #icon>
                <i class="el-icon-unlock"></i>
              </template>
              INITIALIZE ACCESS
            </GlowButton>
          </div>

          <!-- 登录方式切换 -->
          <div v-if="enableMobileRegister" class="login-type-switcher">
            <div class="switcher-label">ACCESS METHOD</div>
            <div class="switch-buttons">
              <GlowButton
                :type="!isMobileLogin ? 'primary' : 'secondary'"
                size="small"
                icon="user"
                @click="switchLoginType('username')"
                class="switch-btn"
              >
                USERNAME
              </GlowButton>
              <GlowButton
                :type="isMobileLogin ? 'primary' : 'secondary'"
                size="small"
                icon="mobile-phone"
                @click="switchLoginType('mobile')"
                class="switch-btn"
              >
                MOBILE
              </GlowButton>
            </div>
          </div>

          <!-- 用户协议 -->
          <div class="terms-agreement">
            <span class="terms-text">ACCESS AGREEMENT</span>
            <div class="terms-links">
              <span class="terms-link">USER PROTOCOL</span>
              <span class="separator">|</span>
              <span class="terms-link">PRIVACY POLICY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部版本信息 -->
    <div class="footer-info">
      <version-footer />
    </div>
  </div>
</template>

<script>
import Api from '@/apis/api';
import VersionFooter from '@/components/VersionFooter.vue';
import TechParticles from '@/components/TechParticles.vue';
import GlowButton from '@/components/GlowButton.vue';
import IronInput from '@/components/IronInput.vue';
import { getUUID, goToPage, showDanger, showSuccess, validateMobile } from '@/utils';
import { mapState } from 'vuex';

export default {
  name: 'IronManLogin',
  components: {
    VersionFooter,
    TechParticles,
    GlowButton,
    IronInput
  },
  computed: {
    ...mapState({
      allowUserRegister: state => state.pubConfig.allowUserRegister,
      enableMobileRegister: state => state.pubConfig.enableMobileRegister,
      mobileAreaList: state => state.pubConfig.mobileAreaList
    })
  },
  data() {
    return {
      activeName: "username",
      form: {
        username: '',
        password: '',
        captcha: '',
        captchaId: '',
        areaCode: '+86',
        mobile: ''
      },
      captchaUuid: '',
      captchaUrl: '',
      isMobileLogin: false,
      // 新增状态管理
      loginLoading: false,
      loginScanning: false,
      // 错误信息管理
      usernameError: '',
      mobileError: '',
      passwordError: '',
      captchaError: ''
    }
  },
  mounted() {
    this.fetchCaptcha();
    this.$store.dispatch('fetchPubConfig').then(() => {
      // 根据配置决定默认登录方式
      this.isMobileLogin = this.enableMobileRegister;
    });
  },
  methods: {
    fetchCaptcha() {
      if (this.$store.getters.getToken) {
        if (this.$route.path !== '/home') {
          this.$router.push('/home')
        }
      } else {
        this.captchaUuid = getUUID();

        Api.user.getCaptcha(this.captchaUuid, (res) => {
          if (res.status === 200) {
            const blob = new Blob([res.data], { type: res.data.type });
            this.captchaUrl = URL.createObjectURL(blob);
          } else {
            showDanger('验证码加载失败，点击刷新');
          }
        });
      }
    },

    // 切换登录方式
    switchLoginType(type) {
      this.isMobileLogin = type === 'mobile';
      // 清空表单和错误信息
      this.clearForm();
      this.clearErrors();
      this.fetchCaptcha();
    },

    // 清空表单
    clearForm() {
      this.form.username = '';
      this.form.mobile = '';
      this.form.password = '';
      this.form.captcha = '';
    },

    // 清空错误信息
    clearErrors() {
      this.usernameError = '';
      this.mobileError = '';
      this.passwordError = '';
      this.captchaError = '';
    },

    // 封装输入验证逻辑
    validateInput(input, field, message) {
      if (!input.trim()) {
        this[field] = message;
        return false;
      }
      this[field] = '';
      return true;
    },

    // 验证表单数据
    validateForm() {
      this.clearErrors();
      let isValid = true;

      if (this.isMobileLogin) {
        // 手机号登录验证
        if (!validateMobile(this.form.mobile, this.form.areaCode)) {
          this.mobileError = 'Please enter a valid mobile number';
          isValid = false;
        }
        // 拼接手机号作为用户名
        this.form.username = this.form.areaCode + this.form.mobile;
      } else {
        // 用户名登录验证
        if (!this.validateInput(this.form.username, 'usernameError', 'Username cannot be empty')) {
          isValid = false;
        }
      }

      // 验证密码
      if (!this.validateInput(this.form.password, 'passwordError', 'Password cannot be empty')) {
        isValid = false;
      }

      // 验证验证码
      if (!this.validateInput(this.form.captcha, 'captchaError', 'Verification code cannot be empty')) {
        isValid = false;
      }

      return isValid;
    },

    async login() {
      // 表单验证
      if (!this.validateForm()) {
        return;
      }

      // 开始登录流程
      this.loginLoading = true;
      this.loginScanning = true;

      this.form.captchaId = this.captchaUuid;

      try {
        await new Promise((resolve, reject) => {
          Api.user.login(this.form, ({ data }) => {
            showSuccess('Login Successful!');
            this.$store.commit('setToken', JSON.stringify(data.data));
            
            // 模拟系统初始化延迟
            setTimeout(() => {
              this.loginScanning = false;
              goToPage('/home');
              resolve(data);
            }, 1500);
          }, (err) => {
            showDanger(err.data.msg || 'Login failed');
            if (err.data != null && err.data.msg != null && err.data.msg.indexOf('图形验证码') > -1) {
              this.fetchCaptcha();
            }
            reject(err);
          });
        });
      } catch (error) {
        this.loginLoading = false;
        this.loginScanning = false;
        
        // 重新获取验证码
        setTimeout(() => {
          this.fetchCaptcha();
        }, 1000);
      }
    },

    goToRegister() {
      goToPage('/register')
    },
    goToForgetPassword() {
      goToPage('/retrieve-password')
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/ironman-theme.scss';

// ============= 主容器样式 =============
.ironman-login-container {
  @extend .ironman-container;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 30%, rgba(220, 20, 60, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
  overflow-x: hidden;
}

// ============= 主布局容器 =============
.login-main-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  grid-template-rows: auto 1fr;
  grid-template-areas: 
    "header header"
    "decoration login";
  gap: 40px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
}

// ============= 品牌头部 =============
.brand-header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg, $gold-primary, transparent);
    box-shadow: 0 0 10px $gold-primary;
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 15px;
  
  .logo-image {
    width: 50px;
    height: 50px;
    filter: drop-shadow(0 0 10px rgba(220, 20, 60, 0.5));
    transition: all 0.3s ease;
    
    &:hover {
      filter: drop-shadow(0 0 15px rgba(220, 20, 60, 0.8));
      transform: rotate(5deg);
    }
  }
  
  .brand-text {
    height: 22px;
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
  }
}

.hud-status {
  display: flex;
  gap: 30px;
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: $text-secondary;
    text-transform: uppercase;
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.5);
      
      &.active {
        background: $armor-red-primary;
        border-color: $armor-red-primary;
        box-shadow: 0 0 10px $armor-red-primary;
        animation: pulse-dot 2s ease-in-out infinite;
      }
    }
  }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

// ============= 左侧装饰面板 =============
.left-decoration-panel {
  grid-area: decoration;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.armor-frame {
  width: 300px;
  height: 400px;
  position: relative;
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 20px;
  background: rgba(26, 26, 26, 0.3);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, $armor-red-primary, $gold-primary, $armor-red-primary);
    border-radius: 22px;
    z-index: -1;
    filter: blur(8px);
    opacity: 0.3;
  }
}

.frame-corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 3px solid $gold-primary;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: $armor-red-primary;
    box-shadow: 0 0 5px $armor-red-primary;
  }
  
  &::before {
    width: 15px;
    height: 2px;
  }
  
  &::after {
    width: 2px;
    height: 15px;
  }
}

.frame-tl {
  top: -3px;
  left: -3px;
  border-bottom: none;
  border-right: none;
  
  &::before { top: -2px; left: -2px; }
  &::after { top: -2px; left: -2px; }
}

.frame-tr {
  top: -3px;
  right: -3px;
  border-bottom: none;
  border-left: none;
  
  &::before { top: -2px; right: -2px; }
  &::after { top: -2px; right: -2px; }
}

.frame-bl {
  bottom: -3px;
  left: -3px;
  border-top: none;
  border-right: none;
  
  &::before { bottom: -2px; left: -2px; }
  &::after { bottom: -2px; left: -2px; }
}

.frame-br {
  bottom: -3px;
  right: -3px;
  border-top: none;
  border-left: none;
  
  &::before { bottom: -2px; right: -2px; }
  &::after { bottom: -2px; right: -2px; }
}

// 能量核心动画
.energy-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
}

.core-ring {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  animation: rotate-ring 8s linear infinite;
  
  &.core-ring-1 {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-color: rgba(220, 20, 60, 0.8);
    animation-duration: 6s;
  }
  
  &.core-ring-2 {
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    border-color: rgba(255, 215, 0, 0.6);
    animation-duration: 8s;
    animation-direction: reverse;
  }
  
  &.core-ring-3 {
    top: 30px;
    left: 30px;
    right: 30px;
    bottom: 30px;
    border-color: rgba(220, 20, 60, 0.4);
    animation-duration: 10s;
  }
}

.core-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, $armor-red-primary 0%, transparent 70%);
  border-radius: 50%;
  box-shadow: 0 0 30px $armor-red-primary;
  animation: pulse-core 3s ease-in-out infinite alternate;
}

@keyframes rotate-ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse-core {
  0% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

// 系统信息显示
.system-info {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
  font-family: 'Courier New', monospace;
  
  .info-line {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 11px;
    
    .label {
      color: $text-secondary;
      text-transform: uppercase;
    }
    
    .value {
      color: $gold-primary;
      font-weight: bold;
      text-transform: uppercase;
    }
  }
}

// ============= 右侧登录面板 =============
.login-panel {
  grid-area: login;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    height: 60px;
    background: linear-gradient(90deg, transparent, $gold-primary, transparent);
    opacity: 0.6;
    filter: blur(2px);
  }
}

// 登录标题区域
.login-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  
  .header-decoration {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    
    &.reverse {
      margin-bottom: 0;
      margin-top: 15px;
    }
    
    .deco-line {
      width: 60px;
      height: 1px;
      background: linear-gradient(90deg, transparent, $gold-primary, transparent);
      margin: 0 10px;
    }
    
    .deco-dot {
      width: 6px;
      height: 6px;
      background: $armor-red-primary;
      border-radius: 50%;
      box-shadow: 0 0 8px $armor-red-primary;
    }
  }
  
  .login-title {
    font-size: 24px;
    font-weight: 700;
    color: $gold-primary;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    font-family: 'Courier New', monospace;
  }
  
  .login-subtitle {
    font-size: 12px;
    color: $text-secondary;
    margin: 5px 0 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: 'Courier New', monospace;
  }
}

// 登录表单
.login-form {
  margin-bottom: 30px;
  
  // 手机号输入组
  .mobile-input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    
    .area-code-select {
      width: 120px;
      
      .iron-select {
        :deep(.el-input__inner) {
          background: rgba(26, 26, 26, 0.9);
          border: 2px solid rgba(255, 165, 0, 0.3);
          color: $text-primary;
          font-size: 12px;
          padding: 0 10px;
          height: 48px;
          
          &:focus {
            border-color: $gold-primary;
            box-shadow: $glow-gold-soft;
          }
        }
      }
    }
    
    .mobile-input {
      flex: 1;
    }
  }
  
  // 验证码组
  .captcha-group {
    display: flex;
    gap: 15px;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .captcha-input {
      flex: 1;
    }
    
    .captcha-image-container {
      position: relative;
      width: 120px;
      height: 48px;
      border: 2px solid rgba(255, 165, 0, 0.3);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: $gold-primary;
        box-shadow: $glow-gold-soft;
      }
      
      .captcha-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .captcha-refresh {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: $gold-primary;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        
        i {
          font-size: 12px;
        }
      }
      
      &:hover .captcha-refresh {
        opacity: 1;
      }
    }
  }
  
  // 功能链接
  .function-links {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    
    .link-button {
      font-size: 11px;
      padding: 8px 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

// 登录按钮区域
.login-actions {
  margin-bottom: 25px;
  
  .main-login-button {
    font-size: 16px;
    letter-spacing: 2px;
    height: 50px;
  }
}

// 登录方式切换器
.login-type-switcher {
  margin-bottom: 25px;
  text-align: center;
  
  .switcher-label {
    font-size: 11px;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
    font-family: 'Courier New', monospace;
  }
  
  .switch-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    
    .switch-btn {
      min-width: 90px;
      font-size: 11px;
      padding: 8px 16px;
    }
  }
}

// 用户协议
.terms-agreement {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  
  .terms-text {
    display: block;
    font-size: 10px;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
    font-family: 'Courier New', monospace;
  }
  
  .terms-links {
    font-size: 11px;
    
    .terms-link {
      color: $gold-primary;
      cursor: pointer;
      text-transform: uppercase;
      transition: color 0.3s ease;
      
      &:hover {
        color: $gold-light;
        text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
      }
    }
    
    .separator {
      color: $text-secondary;
      margin: 0 8px;
    }
  }
}

// ============= 底部版本信息 =============
.footer-info {
  padding: 20px;
  text-align: center;
  z-index: 2;
  position: relative;
}

// ============= 响应式设计 =============
@media (max-width: 1024px) {
  .login-main-container {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "header"
      "login";
    gap: 20px;
  }
  
  .left-decoration-panel {
    display: none;
  }
  
  .login-card {
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .brand-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .hud-status {
    justify-content: center;
    gap: 20px;
  }
  
  .login-main-container {
    padding: 15px;
  }
  
  .login-card {
    padding: 30px 20px;
  }
  
  .mobile-input-group {
    flex-direction: column;
    
    .area-code-select {
      width: 100%;
    }
  }
  
  .captcha-group {
    flex-direction: column;
    
    .captcha-image-container {
      width: 100%;
      height: 60px;
    }
  }
  
  .function-links {
    flex-direction: column;
    gap: 10px;
    
    .link-button {
      width: 100%;
    }
  }
  
  .switch-buttons {
    flex-direction: column;
    
    .switch-btn {
      width: 100%;
    }
  }
}

@media (max-width: 480px) {
  .login-main-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 25px 15px;
  }
  
  .login-title {
    font-size: 20px;
  }
}

// ============= Element UI 样式覆盖 =============
:deep(.el-select) {
  .el-input__inner {
    background: rgba(26, 26, 26, 0.9);
    border: 2px solid rgba(255, 165, 0, 0.3);
    color: $text-primary;
    border-radius: 8px;
    
    &:focus {
      border-color: $gold-primary;
      box-shadow: $glow-gold-soft;
    }
  }
}

:deep(.el-select-dropdown) {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 165, 0, 0.5);
  
  .el-select-dropdown__item {
    color: $text-primary;
    
    &:hover {
      background: rgba(255, 215, 0, 0.1);
    }
    
    &.selected {
      background: rgba(220, 20, 60, 0.2);
      color: $gold-primary;
    }
  }
}
</style>
