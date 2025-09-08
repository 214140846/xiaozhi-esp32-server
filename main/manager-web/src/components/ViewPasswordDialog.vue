<template>
  <el-dialog :visible.sync="visible" width="400px" center>
    <div class="dialog-header">
      <div class="icon-container">
        <shield-icon size="20" color="#ffffff" />
      </div>
      用户新密码
    </div>
    <div class="divider" />
    <div class="dialog-content">
      <div class="label-container">
        <div class="required-star">*</div>
        用户新密码：
      </div>
      <div class="input-46" style="margin-top: 12px;">
        <el-input v-model="password" type="text" :readonly="true" style="font-weight: bold; color: #333;" />
      </div>
    </div>
    <div class="button-container">
      <div class="dialog-btn close-btn" @click="closeDialog">
        关闭
      </div>
      <div class="dialog-btn copy-btn" @click="copyPassword">
        复制密码
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { ShieldIcon } from 'vue-feather-icons'

export default {
  components: {
    ShieldIcon
  },
  name: 'ViewPasswordDialog',
  props: {
    visible: { type: Boolean, required: true },
    password: { type: String, default: '' }
  },
  methods: {
    closeDialog() {
      this.$emit('update:visible', false)
    },
    copyPassword() {
      navigator.clipboard.writeText(this.password)
      this.$message.success({
        message: '密码已复制',
        showClose: true
      })
    }
  }
}
</script>

<style scoped lang="scss">

.input-46 {
  border: 1px solid var(--glass-border);
  background: rgba(26, 26, 46, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 15px;
}

.dialog-btn {
  cursor: pointer;
  flex: 1;
  border-radius: 23px;
  height: 40px;
  font-weight: 500;
  font-size: 12px;
  line-height: 40px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 15px rgba(201, 102, 255, 0.3);
  }
}

::v-deep .el-dialog {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  box-shadow: var(--glass-shadow);
  color: var(--text-primary);
}

::v-deep .el-dialog__headerbtn {
  display: none;
}

::v-deep .el-dialog__body {
  padding: 4px 6px;
  background: transparent;
}

::v-deep .el-input__inner {
  background-color: rgba(26, 26, 46, 0.6) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--text-primary) !important;
  cursor: default !important;
  
  &:focus {
    border-color: var(--primary-purple) !important;
    box-shadow: 0 0 10px rgba(201, 102, 255, 0.3) !important;
  }
}

// 对话框头部
.dialog-header {
  margin: 0 10px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  text-align: left;
  color: var(--text-primary);
}

.icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-purple), #B347E8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(201, 102, 255, 0.4);
}

// 分割线
.divider {
  height: 1px;
  background: var(--glass-border);
  margin: 0 10px;
}

// 对话框内容
.dialog-content {
  margin: 22px 15px;
}

.label-container {
  font-weight: 400;
  font-size: 14px;
  text-align: left;
  color: var(--text-secondary);
}

.required-star {
  color: #EF4444;
  display: inline-block;
}

// 按钮容器
.button-container {
  display: flex;
  margin: 15px 15px;
  gap: 7px;
}

.close-btn {
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(201, 102, 255, 0.2);
    border-color: var(--primary-purple);
    color: var(--text-primary);
  }
}

.copy-btn {
  background: linear-gradient(135deg, var(--primary-purple), #B347E8);
  border: 1px solid var(--primary-purple);
  color: white;
  box-shadow: 0 0 15px rgba(201, 102, 255, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #D985FF, var(--primary-purple));
    box-shadow: 0 0 20px rgba(201, 102, 255, 0.5);
  }
}
</style>
