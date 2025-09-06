<!--
发光按钮组件 - GlowButton
Glow Button Component

功能特点：
- 机甲红色发光效果
- 悬停和点击动画
- 可配置按钮类型和尺寸
- 集成Element UI按钮功能
- 能量充电动画效果
-->

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 能量波纹背景 -->
    <div class="energy-ripple" :class="{ 'active': rippleActive }"></div>
    
    <!-- 扫描线效果 -->
    <div class="scan-overlay" :class="{ 'scanning': isScanning }"></div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner-ring"></div>
    </div>
    
    <!-- 按钮内容 -->
    <span class="button-content" :class="{ 'loading': loading }">
      <!-- 图标插槽 -->
      <slot name="icon" v-if="!loading">
        <i v-if="icon" :class="iconClass"></i>
      </slot>
      
      <!-- 文字内容 -->
      <span v-if="$slots.default" class="button-text">
        <slot></slot>
      </span>
    </span>
    
    <!-- 边框发光效果 -->
    <div class="border-glow"></div>
    
    <!-- 角落装饰 -->
    <div class="corner-decorations">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
    </div>
  </button>
</template>

<script>
export default {
  name: 'GlowButton',
  props: {
    // 按钮类型
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'danger', 'ghost'].includes(value)
    },
    // 按钮尺寸
    size: {
      type: String,
      default: 'medium',
      validator: value => ['large', 'medium', 'small', 'mini'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 原生按钮类型
    nativeType: {
      type: String,
      default: 'button'
    },
    // 图标
    icon: {
      type: String,
      default: ''
    },
    // 是否为块级按钮
    block: {
      type: Boolean,
      default: false
    },
    // 是否显示扫描动画
    scanning: {
      type: Boolean,
      default: false
    },
    // 自定义CSS类
    customClass: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      rippleActive: false,
      isScanning: false,
      clickTimeout: null,
      scanTimeout: null
    }
  },
  
  computed: {
    // 按钮CSS类
    buttonClasses() {
      return [
        'glow-button',
        `glow-button--${this.type}`,
        `glow-button--${this.size}`,
        {
          'is-disabled': this.disabled,
          'is-loading': this.loading,
          'is-block': this.block,
          'is-scanning': this.isScanning || this.scanning
        },
        this.customClass
      ];
    },
    
    // 图标CSS类
    iconClass() {
      return this.icon.startsWith('el-icon-') ? this.icon : `el-icon-${this.icon}`;
    }
  },
  
  watch: {
    scanning(newVal) {
      this.isScanning = newVal;
    }
  },
  
  methods: {
    // 处理点击事件
    handleClick(event) {
      if (this.disabled || this.loading) return;
      
      // 触发波纹效果
      this.triggerRipple();
      
      // 触发扫描效果
      this.triggerScan();
      
      // 发送点击事件
      this.$emit('click', event);
    },
    
    // 处理鼠标按下
    handleMouseDown() {
      if (this.disabled || this.loading) return;
      this.rippleActive = true;
    },
    
    // 处理鼠标释放
    handleMouseUp() {
      this.rippleActive = false;
    },
    
    // 处理鼠标进入
    handleMouseEnter() {
      if (this.disabled || this.loading) return;
      // 可以添加额外的悬停效果
    },
    
    // 处理鼠标离开
    handleMouseLeave() {
      this.rippleActive = false;
    },
    
    // 触发波纹效果
    triggerRipple() {
      this.rippleActive = true;
      
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }
      
      this.clickTimeout = setTimeout(() => {
        this.rippleActive = false;
      }, 600);
    },
    
    // 触发扫描效果
    triggerScan() {
      this.isScanning = true;
      
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      
      this.scanTimeout = setTimeout(() => {
        this.isScanning = false;
      }, 1000);
    }
  },
  
  beforeDestroy() {
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/ironman-theme.scss';

.glow-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: 2px solid $armor-red-primary;
  border-radius: 8px;
  background: $gradient-armor-red;
  color: $text-primary;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  outline: none;
  box-shadow: $shadow-glow-red;
  
  // 默认发光效果
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: $gradient-armor-red;
    border-radius: 10px;
    z-index: -1;
    filter: blur(8px);
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }
  
  // 悬停效果
  &:hover:not(.is-disabled):not(.is-loading) {
    border-color: $armor-red-light;
    box-shadow: $glow-red, $shadow-elevated;
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
      filter: blur(12px);
    }
    
    .border-glow {
      opacity: 1;
    }
    
    .corner-decorations {
      opacity: 1;
    }
  }
  
  // 激活效果
  &:active:not(.is-disabled):not(.is-loading) {
    transform: translateY(0);
    box-shadow: $glow-red-soft;
  }
  
  // 禁用状态
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    border-color: #666;
    background: linear-gradient(135deg, #666 0%, #444 100%);
    box-shadow: none;
    
    &::before {
      opacity: 0;
    }
  }
  
  // 加载状态
  &.is-loading {
    cursor: not-allowed;
    
    .button-content.loading {
      opacity: 0.7;
    }
  }
  
  // 块级按钮
  &.is-block {
    width: 100%;
    display: flex;
  }
  
  // 扫描状态
  &.is-scanning {
    .scan-overlay {
      opacity: 1;
    }
  }
}

// 按钮类型样式
.glow-button--secondary {
  background: transparent;
  border-color: $gold-primary;
  color: $gold-primary;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
  
  &::before {
    background: linear-gradient(135deg, $gold-primary 0%, $gold-dark 100%);
  }
  
  &:hover:not(.is-disabled):not(.is-loading) {
    background: rgba(255, 215, 0, 0.1);
    border-color: $gold-light;
    box-shadow: $glow-gold, $shadow-elevated;
  }
}

.glow-button--danger {
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  border-color: #ff4444;
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.4);
  
  &::before {
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  }
}

.glow-button--ghost {
  background: transparent;
  border-color: rgba(220, 20, 60, 0.5);
  color: $text-primary;
  box-shadow: none;
  
  &::before {
    opacity: 0;
  }
  
  &:hover:not(.is-disabled):not(.is-loading) {
    background: rgba(220, 20, 60, 0.1);
    border-color: $armor-red-primary;
    box-shadow: $glow-red-soft;
  }
}

// 按钮尺寸
.glow-button--large {
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 10px;
}

.glow-button--medium {
  padding: 12px 24px;
  font-size: 14px;
  border-radius: 8px;
}

.glow-button--small {
  padding: 8px 16px;
  font-size: 12px;
  border-radius: 6px;
}

.glow-button--mini {
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 4px;
}

// 能量波纹效果
.energy-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  
  &.active {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  }
}

// 扫描线效果
.scan-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
  opacity: 0;
  transition: all 0.5s ease;
  pointer-events: none;
  
  &.scanning {
    left: 100%;
    opacity: 1;
  }
}

// 加载动画
.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.spinner-ring {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid $text-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 按钮内容
.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1;
  transition: opacity 0.3s ease;
  
  &.loading {
    opacity: 0;
  }
}

.button-text {
  line-height: 1;
}

// 边框发光效果
.border-glow {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(45deg, $armor-red-primary, $gold-primary, $armor-red-primary);
  border-radius: 9px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

// 角落装饰
.corner-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.corner {
  position: absolute;
  width: 12px;
  height: 12px;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: $gold-primary;
    box-shadow: 0 0 3px $gold-primary;
  }
  
  &::before {
    width: 8px;
    height: 1px;
  }
  
  &::after {
    width: 1px;
    height: 8px;
  }
}

.corner-tl {
  top: 4px;
  left: 4px;
  
  &::before {
    top: 0;
    left: 0;
  }
  
  &::after {
    top: 0;
    left: 0;
  }
}

.corner-tr {
  top: 4px;
  right: 4px;
  
  &::before {
    top: 0;
    right: 0;
  }
  
  &::after {
    top: 0;
    right: 0;
  }
}

.corner-bl {
  bottom: 4px;
  left: 4px;
  
  &::before {
    bottom: 0;
    left: 0;
  }
  
  &::after {
    bottom: 0;
    left: 0;
  }
}

.corner-br {
  bottom: 4px;
  right: 4px;
  
  &::before {
    bottom: 0;
    right: 0;
  }
  
  &::after {
    bottom: 0;
    right: 0;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .glow-button {
    padding: 10px 20px;
    font-size: 13px;
    
    &::before {
      filter: blur(4px);
    }
    
    &:hover:not(.is-disabled):not(.is-loading) {
      &::before {
        filter: blur(6px);
      }
    }
  }
  
  .glow-button--large {
    padding: 12px 24px;
    font-size: 14px;
  }
  
  .glow-button--small {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>