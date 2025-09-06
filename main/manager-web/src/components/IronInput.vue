<!--
机甲输入框组件 - IronInput  
Iron Input Component

功能特点：
- 机甲主题样式设计
- 集成Element UI输入框功能
- 金色边框和发光效果
- 输入状态动画反馈
- 支持图标和验证状态
-->

<template>
  <div class="iron-input-wrapper" :class="wrapperClasses">
    <!-- 输入框容器 -->
    <div class="iron-input-container">
      <!-- 左侧图标 -->
      <div v-if="prefixIcon || $slots.prefix" class="input-prefix">
        <slot name="prefix">
          <i v-if="prefixIcon" :class="prefixIconClass"></i>
        </slot>
      </div>
      
      <!-- 主输入区域 -->
      <div class="input-main">
        <!-- Element UI 输入框 -->
        <el-input
          ref="elInput"
          v-model="currentValue"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :minlength="minlength"
          :show-password="showPassword"
          :clearable="clearable"
          :show-word-limit="showWordLimit"
          :tabindex="tabindex"
          :resize="resize"
          :autofocus="autofocus"
          :form="form"
          :label="label"
          :size="size"
          :rows="rows"
          :autosize="autosize"
          class="iron-el-input"
          @blur="handleBlur"
          @focus="handleFocus"
          @change="handleChange"
          @input="handleInput"
          @clear="handleClear"
          @keydown="$emit('keydown', $event)"
          @keypress="$emit('keypress', $event)"
          @keyup="$emit('keyup', $event)"
        />
        
        <!-- 输入状态指示器 -->
        <div class="input-status-indicator" :class="statusClass"></div>
      </div>
      
      <!-- 右侧图标/操作区 -->
      <div v-if="suffixIcon || $slots.suffix || validationIcon" class="input-suffix">
        <slot name="suffix">
          <!-- 验证状态图标 -->
          <i v-if="validationIcon" :class="validationIconClass" class="validation-icon"></i>
          <!-- 后缀图标 -->
          <i v-else-if="suffixIcon" :class="suffixIconClass"></i>
        </slot>
      </div>
      
      <!-- 扫描线效果 -->
      <div class="scan-line" :class="{ 'active': isFocused }"></div>
      
      <!-- 能量条 -->
      <div class="energy-bar" :class="{ 'active': isFocused || hasValue }">
        <div class="energy-fill" :style="energyFillStyle"></div>
      </div>
    </div>
    
    <!-- 错误消息 -->
    <transition name="error-slide">
      <div v-if="errorMessage" class="error-message">
        <i class="el-icon-warning"></i>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>
    
    <!-- 帮助文本 -->
    <div v-if="helpText && !errorMessage" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'IronInput',
  props: {
    // Element UI 输入框原有属性
    value: [String, Number],
    type: {
      type: String,
      default: 'text'
    },
    size: String,
    resize: String,
    form: String,
    disabled: Boolean,
    readonly: Boolean,
    placeholder: String,
    clearable: Boolean,
    showPassword: Boolean,
    showWordLimit: Boolean,
    suffixIcon: String,
    prefixIcon: String,
    label: String,
    tabindex: String,
    validateEvent: {
      type: Boolean,
      default: true
    },
    maxlength: Number,
    minlength: Number,
    rows: {
      type: Number,
      default: 2
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    autofocus: Boolean,
    
    // 自定义属性
    // 验证状态
    validateStatus: {
      type: String,
      validator: value => ['', 'success', 'warning', 'error'].includes(value),
      default: ''
    },
    // 错误消息
    errorMessage: String,
    // 帮助文本
    helpText: String,
    // 是否必填
    required: Boolean,
    // 自定义样式类
    customClass: String,
    // 是否显示能量条
    showEnergyBar: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      isFocused: false,
      currentValue: this.value,
      energyLevel: 0
    }
  },
  
  computed: {
    // 包装器CSS类
    wrapperClasses() {
      return [
        'iron-input-wrapper',
        {
          'is-focused': this.isFocused,
          'is-disabled': this.disabled,
          'has-value': this.hasValue,
          'is-required': this.required,
          [`is-${this.validateStatus}`]: this.validateStatus
        },
        this.customClass
      ];
    },
    
    // 是否有值
    hasValue() {
      return this.currentValue && String(this.currentValue).length > 0;
    },
    
    // 前缀图标CSS类
    prefixIconClass() {
      return this.prefixIcon.startsWith('el-icon-') ? this.prefixIcon : `el-icon-${this.prefixIcon}`;
    },
    
    // 后缀图标CSS类  
    suffixIconClass() {
      return this.suffixIcon.startsWith('el-icon-') ? this.suffixIcon : `el-icon-${this.suffixIcon}`;
    },
    
    // 验证图标
    validationIcon() {
      if (!this.validateStatus) return '';
      const iconMap = {
        success: 'el-icon-check',
        warning: 'el-icon-warning',
        error: 'el-icon-close'
      };
      return iconMap[this.validateStatus];
    },
    
    // 验证图标CSS类
    validationIconClass() {
      return [
        this.validationIcon,
        `validation-${this.validateStatus}`
      ];
    },
    
    // 状态指示器CSS类
    statusClass() {
      return {
        'focused': this.isFocused,
        'has-value': this.hasValue,
        'success': this.validateStatus === 'success',
        'warning': this.validateStatus === 'warning',
        'error': this.validateStatus === 'error'
      };
    },
    
    // 能量条样式
    energyFillStyle() {
      let width = 0;
      
      if (this.isFocused) {
        width = 100;
      } else if (this.hasValue) {
        // 根据输入长度计算能量条宽度
        const length = String(this.currentValue).length;
        width = Math.min((length / 20) * 100, 100);
      }
      
      return {
        width: `${width}%`,
        transition: this.isFocused ? 'width 0.3s ease' : 'width 0.5s ease'
      };
    }
  },
  
  watch: {
    value(newVal) {
      this.currentValue = newVal;
    },
    
    currentValue(newVal) {
      this.$emit('input', newVal);
      this.$emit('change', newVal);
    }
  },
  
  methods: {
    // 获取焦点
    focus() {
      this.$refs.elInput.focus();
    },
    
    // 失去焦点
    blur() {
      this.$refs.elInput.blur();
    },
    
    // 选中输入框文本
    select() {
      this.$refs.elInput.select();
    },
    
    // 处理焦点事件
    handleFocus(event) {
      this.isFocused = true;
      this.$emit('focus', event);
    },
    
    // 处理失焦事件
    handleBlur(event) {
      this.isFocused = false;
      this.$emit('blur', event);
    },
    
    // 处理输入事件
    handleInput(value) {
      this.currentValue = value;
    },
    
    // 处理变化事件
    handleChange(value) {
      this.$emit('change', value);
    },
    
    // 处理清空事件
    handleClear() {
      this.currentValue = '';
      this.$emit('clear');
      this.$emit('input', '');
      this.$emit('change', '');
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/ironman-theme.scss';

.iron-input-wrapper {
  display: block;
  width: 100%;
  margin-bottom: 16px;
  
  // 聚焦状态
  &.is-focused {
    .iron-input-container {
      border-color: $gold-primary;
      box-shadow: $glow-gold-soft;
      
      &::before {
        opacity: 1;
        transform: scaleX(1);
      }
    }
  }
  
  // 禁用状态
  &.is-disabled {
    .iron-input-container {
      background: rgba(26, 26, 26, 0.3);
      border-color: rgba(255, 165, 0, 0.2);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  // 验证状态
  &.is-success {
    .iron-input-container {
      border-color: #67c23a;
      
      &.is-focused {
        box-shadow: 0 0 8px rgba(103, 194, 58, 0.3);
      }
    }
  }
  
  &.is-warning {
    .iron-input-container {
      border-color: #e6a23c;
      
      &.is-focused {
        box-shadow: 0 0 8px rgba(230, 162, 60, 0.3);
      }
    }
  }
  
  &.is-error {
    .iron-input-container {
      border-color: $armor-red-light;
      
      &.is-focused {
        box-shadow: 0 0 8px rgba(255, 69, 0, 0.4);
      }
    }
  }
}

// 输入框容器
.iron-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(26, 26, 26, 0.9);
  border: 2px solid rgba(255, 165, 0, 0.3);
  border-radius: 8px;
  padding: 0 16px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  // 顶部发光线条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, $gold-primary, transparent);
    opacity: 0;
    transform: scaleX(0);
    transition: all 0.3s ease;
  }
  
  // 悬停效果
  &:hover:not(.is-disabled) {
    border-color: rgba(255, 165, 0, 0.5);
    background: rgba(26, 26, 26, 0.95);
  }
}

// 前缀图标
.input-prefix {
  display: flex;
  align-items: center;
  margin-right: 12px;
  color: $text-secondary;
  font-size: 18px;
  
  i {
    transition: color 0.3s ease;
  }
  
  .is-focused & {
    color: $gold-primary;
  }
}

// 主输入区域
.input-main {
  flex: 1;
  position: relative;
  
  // Element UI 输入框样式覆盖
  :deep(.iron-el-input) {
    .el-input__inner {
      background: transparent;
      border: none;
      color: $text-primary;
      font-size: 14px;
      font-weight: 500;
      padding: 0;
      height: auto;
      line-height: 1.5;
      
      &::placeholder {
        color: $text-secondary;
        font-style: italic;
        font-weight: 400;
      }
      
      &:focus {
        outline: none;
        box-shadow: none;
      }
    }
    
    // 密码显示按钮
    .el-input__suffix {
      .el-input__suffix-inner {
        color: $text-secondary;
        
        &:hover {
          color: $gold-primary;
        }
      }
    }
    
    // 清空按钮
    .el-input__clear {
      color: $text-secondary;
      
      &:hover {
        color: $armor-red-light;
      }
    }
  }
}

// 输入状态指示器
.input-status-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  width: 3px;
  height: 60%;
  background: transparent;
  border-radius: 2px;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  
  &.focused {
    background: linear-gradient(180deg, $gold-primary 0%, $gold-dark 100%);
    box-shadow: 0 0 6px $gold-primary;
  }
  
  &.success {
    background: linear-gradient(180deg, #67c23a 0%, #529b2e 100%);
  }
  
  &.warning {
    background: linear-gradient(180deg, #e6a23c 0%, #b88230 100%);
  }
  
  &.error {
    background: linear-gradient(180deg, $armor-red-light 0%, $armor-red-dark 100%);
  }
}

// 后缀图标
.input-suffix {
  display: flex;
  align-items: center;
  margin-left: 12px;
  color: $text-secondary;
  font-size: 16px;
  
  .validation-icon {
    transition: all 0.3s ease;
    
    &.validation-success {
      color: #67c23a;
    }
    
    &.validation-warning {
      color: #e6a23c;
    }
    
    &.validation-error {
      color: $armor-red-light;
    }
  }
}

// 扫描线效果
.scan-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, $armor-red-primary, transparent);
  opacity: 0;
  transform: scaleX(0);
  transform-origin: center;
  transition: all 0.3s ease;
  
  &.active {
    opacity: 0.8;
    transform: scaleX(1);
    animation: scan-pulse 2s ease-in-out infinite;
  }
}

@keyframes scan-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

// 能量条
.energy-bar {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 1px;
  overflow: hidden;
  
  &.active {
    .energy-fill {
      opacity: 1;
    }
  }
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, $armor-red-primary 0%, $gold-primary 50%, $armor-red-primary 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  box-shadow: 0 0 4px rgba(220, 20, 60, 0.5);
}

// 错误消息
.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $armor-red-light;
  font-size: 12px;
  margin-top: 6px;
  
  i {
    font-size: 14px;
  }
}

.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease;
}

.error-slide-enter,
.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 帮助文本
.help-text {
  color: $text-secondary;
  font-size: 12px;
  margin-top: 6px;
  font-style: italic;
}

// 响应式适配
@media (max-width: 768px) {
  .iron-input-container {
    height: 44px;
    padding: 0 12px;
  }
  
  .input-prefix,
  .input-suffix {
    margin: 0 8px;
  }
  
  :deep(.iron-el-input) {
    .el-input__inner {
      font-size: 13px;
    }
  }
}

@media (max-width: 480px) {
  .iron-input-container {
    height: 40px;
    border-radius: 6px;
  }
  
  .input-prefix,
  .input-suffix {
    font-size: 16px;
  }
}
</style>