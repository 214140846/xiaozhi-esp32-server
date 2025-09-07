<template>
  <el-dialog title="手动添加设备" :visible="visible" @close="handleClose" width="30%" center>
    <div class="dialog-content">
      <el-form :model="deviceForm" :rules="rules" ref="deviceForm" label-width="100px">
        <el-form-item label="设备型号" prop="board">
          <el-select v-model="deviceForm.board" placeholder="请选择设备型号" style="width: 100%">
            <el-option
              v-for="item in firmwareTypes"
              :key="item.key"
              :label="item.name"
              :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="固件版本" prop="appVersion">
          <el-input v-model="deviceForm.appVersion" placeholder="请输入固件版本"></el-input>
        </el-form-item>
        <el-form-item label="Mac地址" prop="macAddress">
          <el-input v-model="deviceForm.macAddress" placeholder="请输入Mac地址"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div style="display: flex;margin: 15px 15px;gap: 7px;">
      <div class="dialog-btn" @click="submitForm">确定</div>
      <div class="dialog-btn cancel-btn" @click="cancel">取消</div>
    </div>
  </el-dialog>
</template>

<script>
import Api from '@/apis/api';

export default {
  name: 'ManualAddDeviceDialog',
  props: {
    visible: { type: Boolean, required: true },
    agentId: { type: String, required: true }
  },
  data() {
    // MAC地址验证规则
    const validateMac = (rule, value, callback) => {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!value) {
        callback(new Error('请输入Mac地址'));
      } else if (!macRegex.test(value)) {
        callback(new Error('请输入正确的Mac地址格式，例如：00:1A:2B:3C:4D:5E'));
      } else {
        callback();
      }
    };

    return {
      deviceForm: {
        board: '',
        appVersion: '',
        macAddress: ''
      },
      firmwareTypes: [],
      rules: {
        board: [
          { required: true, message: '请选择设备型号', trigger: 'change' }
        ],
        appVersion: [
          { required: true, message: '请输入固件版本', trigger: 'blur' }
        ],
        macAddress: [
          { required: true, validator: validateMac, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getFirmwareTypes();
  },
  methods: {
    async getFirmwareTypes() {
      try {
        const res = await Api.dict.getDictDataByType('FIRMWARE_TYPE');
        this.firmwareTypes = res.data;
      } catch (error) {
        console.error('获取固件类型失败:', error);
        this.$message.error(error.message || '获取固件类型失败');
      }
    },
    submitForm() {
      this.$refs.deviceForm.validate((valid) => {
        if (valid) {
          this.addDevice();
        }
      });
    },
    addDevice() {
      const params = {
        agentId: this.agentId,
        ...this.deviceForm
      };
      
      Api.device.manualAddDevice(params, ({ data }) => {
        if (data.code === 0) {
          this.$message.success('设备添加成功');
          this.$emit('refresh');
          this.closeDialog();
        } else {
          this.$message.error(data.msg || '添加失败');
        }
      });
    },
    closeDialog() {
      this.$emit('update:visible', false);
      this.$refs.deviceForm.resetFields();
    },
    cancel() {
      this.closeDialog();
    },
    handleClose() {
      this.closeDialog();
    }
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 0 20px;
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

.cancel-btn {
  background: rgba(201, 102, 255, 0.15) !important;
  border: 1px solid rgba(201, 102, 255, 0.5) !important;
  color: #C966FF !important;
}

.cancel-btn:hover {
  background: rgba(201, 102, 255, 0.25) !important;
  border-color: #C966FF !important;
  box-shadow: 0 2px 8px rgba(201, 102, 255, 0.3) !important;
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

::v-deep .el-dialog__body {
  padding: 20px 6px;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}
</style> 