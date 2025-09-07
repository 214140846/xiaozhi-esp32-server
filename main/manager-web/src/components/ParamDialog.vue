<template>
  <el-dialog :title="title"
    :visible.sync="visible"
    width="520px"
    class="param-dialog-wrapper"
    :append-to-body="true"
    :close-on-click-modal="false"
    :key="dialogKey"
    custom-class="custom-param-dialog"
    :show-close="false"
  >
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ title }}</h2>
        <button class="custom-close-btn" @click="cancel">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <el-form :model="form" :rules="rules" ref="form" label-width="110px" label-position="left" class="param-form">
        <el-form-item label="参数编码" prop="paramCode" class="form-item">
          <el-input v-model="form.paramCode" placeholder="请输入参数编码" class="custom-input"></el-input>
        </el-form-item>

        <el-form-item label="参数值" prop="paramValue" class="form-item">
          <el-input v-model="form.paramValue" placeholder="请输入参数值" class="custom-input"></el-input>
        </el-form-item>

        <el-form-item label="值类型" prop="valueType" class="form-item">
          <el-select v-model="form.valueType" placeholder="请选择值类型" class="custom-select">
            <el-option v-for="item in valueTypeOptions" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark" class="form-item remark-item">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注" :rows="3" class="custom-textarea"></el-input>
        </el-form-item>
      </el-form>

      <div class="dialog-footer">
        <el-button
          type="primary"
          @click="submit"
          class="save-btn"
          :loading="saving"
          :disabled="saving">
          保存
        </el-button>
        <el-button @click="cancel" class="cancel-btn">
          取消
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '新增参数'
    },
    visible: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => ({
        id: null,
        paramCode: '',
        paramValue: '',
        valueType: 'string',
        remark: ''
      })
    }
  },
  data() {
    return {
      dialogKey: Date.now(),
      saving: false,
      valueTypeOptions: [
        { value: 'string', label: '字符串(string)' },
        { value: 'number', label: '数字(number)' },
        { value: 'boolean', label: '布尔值(boolean)' },
        { value: 'array', label: '数组(array)' },
        { value: 'json', label: 'JSON对象(json)' }
      ],
      rules: {
        paramCode: [
          { required: true, message: "请输入参数编码", trigger: "blur" }
        ],
        paramValue: [
          { required: true, message: "请输入参数值", trigger: "blur" }
        ],
        valueType: [
          { required: true, message: "请选择值类型", trigger: "change" }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.saving = true; // 开始加载
          this.$emit('submit', {
            form: this.form,
            done: () => {
              this.saving = false; // 加载完成
            }
          });

          setTimeout(() => {
            this.saving = false;
          }, 3000);
        }
      });
    },
    cancel() {
      this.saving = false; // 取消时重置状态
      this.$emit('cancel');
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.dialogKey = Date.now();
      }
    }
  }
};
</script>

<style>
.custom-param-dialog {
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
  border: none !important;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0 !important;
    border-radius: 16px;
  }
}
</style>

<style scoped lang="scss">
.param-dialog-wrapper {
  .dialog-container {
    padding: 24px 32px;
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: var(--glass-shadow);
  }

  .dialog-header {
    position: relative;
    margin-bottom: 24px;
    text-align: center;
  }

  .dialog-title {
    font-size: 20px;
    color: var(--text-primary);
    margin: 0;
    padding: 0;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-shadow: 0 0 12px rgba(201, 102, 255, 0.35);
  }

  .custom-close-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--glass-border);
    background: rgba(26, 26, 46, 0.6);
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    outline: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(201, 102, 255, 0.2);

    &:hover {
      color: #ffffff;
      background: linear-gradient(135deg, var(--primary-purple), #B347E8);
      transform: rotate(90deg);
      box-shadow: 0 0 16px rgba(201, 102, 255, 0.4);
      border-color: var(--primary-purple);
    }

    svg {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  .param-form {
    .form-item {
      margin-bottom: 20px;

      :deep(.el-form-item__label) {
        color: var(--text-secondary);
        font-weight: 500;
        padding-right: 12px;
        text-align: right;
        font-size: 14px;
        letter-spacing: 0.2px;
      }
    }

    .custom-input {
      :deep(.el-input__inner) {
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        border: 1px solid var(--glass-border);
        height: 42px;
        padding: 0 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        color: #fff;
        box-shadow: 0 0 10px rgba(201, 102, 255, 0.1);

        &:focus {
          border-color: var(--primary-purple);
          box-shadow: 0 0 12px rgba(201, 102, 255, 0.35);
          background-color: rgba(255, 255, 255, 0.12);
        }

        &::placeholder {
          color: var(--text-placeholder);
          font-weight: 400;
        }
      }
    }

    .custom-select {
      width: 100%;

      :deep(.el-input__inner) {
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        border: 1px solid var(--glass-border);
        height: 42px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        color: #fff;
        box-shadow: 0 0 10px rgba(201, 102, 255, 0.1);

        &:focus {
          border-color: var(--primary-purple);
          box-shadow: 0 0 12px rgba(201, 102, 255, 0.35);
          background-color: rgba(255, 255, 255, 0.12);
        }

        &::placeholder {
          color: var(--text-placeholder);
          font-weight: 400;
        }
      }
    }

    .custom-textarea {
      :deep(.el-textarea__inner) {
        background-color: rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        border: 1px solid var(--glass-border);
        padding: 12px 14px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 14px;
        color: #fff;
        box-shadow: 0 0 10px rgba(201, 102, 255, 0.1);
        line-height: 1.5;

        &:focus {
          border-color: var(--primary-purple);
          box-shadow: 0 0 12px rgba(201, 102, 255, 0.35);
          background-color: rgba(255, 255, 255, 0.12);
        }

        &::placeholder {
          color: var(--text-placeholder);
          font-weight: 400;
        }
      }
    }

    .remark-item :deep(.el-form-item__label) {
      margin-top: -4px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    padding: 16px 0 0;
    margin-top: 16px;

    .save-btn {
      width: 120px;
      height: 42px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, var(--primary-purple), #B347E8);
      color: #ffffff;
      border: 1px solid var(--primary-purple);
      letter-spacing: 0.5px;
      box-shadow: 0 0 16px rgba(201, 102, 255, 0.35);

      &:hover {
        background: linear-gradient(135deg, #D985FF, var(--primary-purple));
        transform: translateY(-1px);
        box-shadow: 0 0 20px rgba(201, 102, 255, 0.5);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 0 14px rgba(201, 102, 255, 0.3);
      }
    }

    .cancel-btn {
      width: 120px;
      height: 42px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: rgba(26, 26, 46, 0.6);
      color: var(--text-secondary);
      border: 1px solid var(--glass-border);
      margin-left: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 0 10px rgba(201, 102, 255, 0.2);

      &:hover {
        background: rgba(201, 102, 255, 0.12);
        color: var(--text-primary);
        border-color: var(--primary-purple);
        transform: translateY(-1px);
        box-shadow: 0 0 16px rgba(201, 102, 255, 0.35);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 0 10px rgba(201, 102, 255, 0.2);
      }
    }
  }
}
</style>
