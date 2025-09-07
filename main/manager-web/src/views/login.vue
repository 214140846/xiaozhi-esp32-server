<template>
  <div class="welcome">
    <!-- 粒子背景动画 -->
    <div class="particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>
    
    <el-container style="height: 100%;">
      <el-header>
        <div class="logo-container">
          <img loading="lazy" alt="小智Logo" src="@/assets/xiaozhi-logo.png" style="width: 45px;height: 45px;" />
          <img loading="lazy" alt="小智AI" src="@/assets/xiaozhi-ai.png" style="height: 18px;" />
        </div>
      </el-header>
      <el-main style="position: relative;">
        <div class="login-box" @keyup.enter="login">
          <div class="login-header">
            <img loading="lazy" alt="欢迎图标" src="@/assets/login/hi.png" class="hi-icon" />
            <div class="login-text">登录</div>
            <div class="login-welcome">
              WELCOME TO LOGIN
            </div>
          </div>
          <div class="login-form-content">
            <!-- 用户名登录 -->
            <template v-if="!isMobileLogin">
              <div class="input-box">
                <img loading="lazy" alt="" class="input-icon" src="@/assets/login/username.png" />
                <el-input v-model="form.username" placeholder="请输入用户名" />
              </div>
            </template>

            <!-- 手机号登录 -->
            <template v-else>
              <div class="input-box">
                <div style="display: flex; align-items: center; width: 100%;">
                  <el-select v-model="form.areaCode" style="width: 220px; margin-right: 10px;">
                    <el-option v-for="item in mobileAreaList" :key="item.key" :label="`${item.name} (${item.key})`"
                      :value="item.key" />
                  </el-select>
                  <el-input v-model="form.mobile" placeholder="请输入手机号码" />
                </div>
              </div>
            </template>

            <div class="input-box">
              <img loading="lazy" alt="" class="input-icon" src="@/assets/login/password.png" />
              <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password />
            </div>
            <div class="captcha-container">
              <div class="input-box">
                <img loading="lazy" alt="验证码图标" class="input-icon" src="@/assets/login/shield.png" />
                <el-input v-model="form.captcha" placeholder="请输入验证码" />
              </div>
              <img loading="lazy" v-if="captchaUrl" :src="captchaUrl" alt="验证码"
                class="captcha-img" @click="fetchCaptcha" />
            </div>
            <div class="login-links">
              <a v-if="allowUserRegister" class="link-item" @click="goToRegister">新用户注册</a>
              <a class="link-item" @click="goToForgetPassword" v-if="enableMobileRegister">忘记密码?</a>
            </div>
          </div>
          <div class="login-btn" @click="login">登录</div>

          <!-- 登录方式切换按钮 -->
          <div class="login-type-container" v-if="enableMobileRegister">
            <el-tooltip content="手机号码登录" placement="bottom">
              <el-button :type="isMobileLogin ? 'primary' : 'default'" icon="el-icon-mobile" circle
                @click="switchLoginType('mobile')"></el-button>
            </el-tooltip>
            <el-tooltip content="用户名登录" placement="bottom">
              <el-button :type="!isMobileLogin ? 'primary' : 'default'" icon="el-icon-user" circle
                @click="switchLoginType('username')"></el-button>
            </el-tooltip>
          </div>

          <div class="user-agreement">
            登录即同意
            <a class="agreement-link">《用户协议》</a>
            和
            <a class="agreement-link">《隐私政策》</a>
          </div>
        </div>
      </el-main>
      <el-footer>
        <version-footer />
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import Api from '@/apis/api';
import VersionFooter from '@/components/VersionFooter.vue';
import { getUUID, goToPage, showDanger, showSuccess, validateMobile } from '@/utils';
import { mapState } from 'vuex';

export default {
  name: 'login',
  components: {
    VersionFooter
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
      isMobileLogin: false
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
      // 清空表单
      this.form.username = '';
      this.form.mobile = '';
      this.form.password = '';
      this.form.captcha = '';
      this.fetchCaptcha();
    },

    // 封装输入验证逻辑
    validateInput(input, message) {
      if (!input.trim()) {
        showDanger(message);
        return false;
      }
      return true;
    },

    async login() {
      if (this.isMobileLogin) {
        // 手机号登录验证
        if (!validateMobile(this.form.mobile, this.form.areaCode)) {
          showDanger('请输入正确的手机号码');
          return;
        }
        // 拼接手机号作为用户名
        this.form.username = this.form.areaCode + this.form.mobile;
      } else {
        // 用户名登录验证
        if (!this.validateInput(this.form.username, '用户名不能为空')) {
          return;
        }
      }

      // 验证密码
      if (!this.validateInput(this.form.password, '密码不能为空')) {
        return;
      }
      // 验证验证码
      if (!this.validateInput(this.form.captcha, '验证码不能为空')) {
        return;
      }

      this.form.captchaId = this.captchaUuid
      Api.user.login(this.form, ({ data }) => {
        showSuccess('登录成功！');
        this.$store.commit('setToken', JSON.stringify(data.data));
        goToPage('/home');
      }, (err) => {
        showDanger(err.data.msg || '登录失败')
        if (err.data != null && err.data.msg != null && err.data.msg.indexOf('图形验证码') > -1) {
          this.fetchCaptcha()
        }
      })

      // 重新获取验证码
      setTimeout(() => {
        this.fetchCaptcha();
      }, 1000);
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
// 导入暗黑科技紫主题样式
</style>
