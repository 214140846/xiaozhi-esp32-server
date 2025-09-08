<template>
  <el-dialog :visible="visible" @close="handleClose" width="24%" center>
    <div
      style="margin: 0 10px 10px;display: flex;align-items: center;gap: 10px;font-weight: 700;font-size: 20px;text-align: left;color: #3d4566;">
      <div
        style="width: 40px;height: 40px;border-radius: 50%;background: #5778ff;display: flex;align-items: center;justify-content: center;">
        <cpu-icon size="18" color="#ffffff" />
      </div>
      添加设备
    </div>
    <div style="height: 1px;background: #e8f0ff;" />
    <div style="margin: 22px 15px;">
      <div style="font-weight: 400;font-size: 14px;text-align: left;color: #3d4566;">
        <div style="color: red;display: inline-block;">*</div>
        <span style="font-size: 11px"> 验证码：</span>
      </div>
      <div class="input-46" style="margin-top: 12px;">
        <el-input placeholder="请输入设备播报的6位数验证码.." v-model="deviceCode" @keyup.enter.native="confirm" />
      </div>
    </div>
    <div style="display: flex;margin: 15px 15px;gap: 7px;">
      <div class="dialog-btn" @click="confirm">
        确定
      </div>
      <div class="dialog-btn" style="background: #e6ebff;border: 1px solid #adbdff;color: #5778ff;" @click="cancel">
        取消
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Api from '@/apis/api';
import { CpuIcon } from 'vue-feather-icons'

export default {
  components: {
    CpuIcon
  },
  name: 'AddDeviceDialog',
  props: {
    visible: { type: Boolean, required: true },
    agentId: { type: String, required: true }
  },
  data() {
    return {
      deviceCode: "",
      loading: false,
    }
  },
  methods: {
    confirm() {
      if (!/^\d{6}$/.test(this.deviceCode)) {
        this.$message.error('请输入6位数字验证码');
        return;
      }
      this.loading = true;
      Api.device.bindDevice(
        this.agentId,
        this.deviceCode, ({ data }) => {
          this.loading = false;
          if (data.code === 0) {
            this.$emit('refresh');
            this.$message.success({
              message: '设备绑定成功',
              showClose: true
            });
            this.closeDialog();
          } else {
            this.$message.error({
              message: data.msg || '绑定失败',
              showClose: true
            });
          }
        }
      );
    },
    closeDialog() {
      this.$emit('update:visible', false);
      this.deviceCode = '';

    },
    cancel() {
      this.$emit('update:visible', false)
      this.deviceCode = ""
    },
    handleClose() {
      this.$emit('update:visible', false);
    },
  }
}
</script>

<style scoped>
.input-46 {
  border: 1px solid rgba(201, 102, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.input-46:focus-within {
  border-color: #C966FF;
  box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
}

.dialog-btn {
  cursor: pointer;
  flex: 1;
  border-radius: 23px;
  background: linear-gradient(135deg, #C966FF, #B347E8);
  border: 1px solid rgba(201, 102, 255, 0.5);
  height: 40px;
  font-weight: 500;
  font-size: 12px;
  color: #fff;
  line-height: 40px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(201, 102, 255, 0.3);
  transition: all 0.3s ease;
}

.dialog-btn:hover {
  background: linear-gradient(135deg, #D985FF, #C966FF);
  box-shadow: 0 4px 12px rgba(201, 102, 255, 0.4);
  transform: translateY(-1px);
}

::v-deep .el-dialog {
  border-radius: 15px;
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(201, 102, 255, 0.1);
  color: #F8FAFC;
}

::v-deep .el-dialog__headerbtn {
  display: none;
}

::v-deep .el-dialog__body {
  padding: 4px 6px;
}

::v-deep .el-dialog__header {
  padding: 10px;
}
</style>