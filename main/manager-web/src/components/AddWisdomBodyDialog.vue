<template>
  <el-dialog :visible="visible" @close="handleClose"  width="25%" center @open="handleOpen">
    <div
      style="margin: 0 10px 10px;display: flex;align-items: center;gap: 10px;font-weight: 700;font-size: 20px;text-align: left;color: #F8FAFC;">
      <div
        style="width: 40px;height: 40px;border-radius: 50%;background: linear-gradient(135deg, #C966FF, #B347E8);display: flex;align-items: center;justify-content: center;box-shadow: 0 4px 15px rgba(201, 102, 255, 0.3);">
        <cpu-icon size="18" color="#ffffff" />
      </div>
      添加智能体
    </div>
    <div style="height: 1px;background: rgba(201, 102, 255, 0.3);" />
    <div style="margin: 22px 15px;">
      <div style="font-weight: 400;text-align: left;color: #F8FAFC;">
        <div style="color: #C966FF;display: inline-block;">*</div> 智能体名称：
      </div>
      <div class="input-46" style="margin-top: 12px;">
        <el-input ref="inputRef" placeholder="请输入智能体名称.." v-model="wisdomBodyName" @keyup.enter.native="confirm" />
      </div>
    </div>
    <div style="display: flex;margin: 15px 15px;gap: 7px;">
      <div class="dialog-btn primary-btn" @click="confirm">
        确定
      </div>
      <div class="dialog-btn secondary-btn" @click="cancel">
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
  name: 'AddWisdomBodyDialog',
  props: {
    visible: { type: Boolean, required: true }
  },
  data() {
    return {
      wisdomBodyName: "",
      inputRef: null
    }
  },
  methods: {
    handleOpen() {
      this.$nextTick(() => {
        this.$refs.inputRef.focus();
      });
    },
    confirm() {
      if (!this.wisdomBodyName.trim()) {
        this.$message.error('请输入智能体名称');
        return;
      }
      Api.agent.addAgent(this.wisdomBodyName, (res) => {
        this.$message.success({
          message: '添加成功',
          showClose: true
        });
        this.$emit('confirm', res);
        this.$emit('update:visible', false);
        this.wisdomBodyName = "";
      });
    },
    cancel() {
      this.$emit('update:visible', false)
      this.wisdomBodyName = ""
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
  border: 1px solid transparent;
}

.primary-btn {
  background: linear-gradient(135deg, #C966FF, #B347E8);
  color: #fff;
  box-shadow: 0 4px 15px rgba(201, 102, 255, 0.3);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #D985FF, #C966FF);
  box-shadow: 0 6px 20px rgba(201, 102, 255, 0.4);
  transform: translateY(-1px);
}

.secondary-btn {
  background: rgba(26, 26, 46, 0.85);
  border: 1px solid rgba(201, 102, 255, 0.3);
  color: #C966FF;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.secondary-btn:hover {
  background: rgba(201, 102, 255, 0.1);
  border-color: #C966FF;
  box-shadow: 0 4px 15px rgba(201, 102, 255, 0.2);
}

::v-deep .el-dialog {
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 102, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(201, 102, 255, 0.2);
}

::v-deep .el-dialog__headerbtn {
  display: none;
}

::v-deep .el-dialog__body {
  padding: 4px 6px;
  background: transparent;
}

::v-deep .el-dialog__header {
  padding: 10px;
  background: transparent;
}

::v-deep .el-input__inner {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(201, 102, 255, 0.3) !important;
  color: #F8FAFC !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

::v-deep .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6) !important;
}

::v-deep .el-input__inner:focus {
  border-color: #C966FF !important;
  box-shadow: 0 0 10px rgba(201, 102, 255, 0.3);
}</style>
</style>