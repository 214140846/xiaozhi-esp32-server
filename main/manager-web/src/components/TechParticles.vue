<!--
科技粒子背景组件 - TechParticles
Tech Particles Background Component

功能特点：
- Canvas动态粒子效果
- 几何线条连接
- 科技网格背景
- 响应式性能优化
- 鼠标交互效果
-->

<template>
  <div class="tech-particles-container">
    <!-- 主粒子画布 -->
    <canvas
      ref="particleCanvas"
      class="particle-canvas"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></canvas>
    
    <!-- 科技网格背景 -->
    <div class="tech-grid"></div>
    
    <!-- 扫描线效果 -->
    <div class="scan-lines">
      <div class="scan-line scan-line-1"></div>
      <div class="scan-line scan-line-2"></div>
      <div class="scan-line scan-line-3"></div>
    </div>
    
    <!-- 角落科技装饰 -->
    <div class="tech-corners">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TechParticles',
  props: {
    // 粒子数量
    particleCount: {
      type: Number,
      default: 80
    },
    // 是否启用鼠标交互
    mouseInteraction: {
      type: Boolean,
      default: true
    },
    // 动画速度
    animationSpeed: {
      type: Number,
      default: 1
    },
    // 是否启用连线
    enableConnections: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      canvas: null,
      ctx: null,
      particles: [],
      mouse: { x: 0, y: 0, active: false },
      animationId: null,
      resizeTimeout: null
    }
  },
  
  mounted() {
    this.initCanvas();
    this.createParticles();
    this.startAnimation();
    this.bindEvents();
  },
  
  beforeDestroy() {
    this.cleanup();
  },
  
  methods: {
    // 初始化Canvas
    initCanvas() {
      this.canvas = this.$refs.particleCanvas;
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
    },
    
    // 设置Canvas尺寸
    resizeCanvas() {
      const container = this.$el;
      this.canvas.width = container.offsetWidth;
      this.canvas.height = container.offsetHeight;
      
      // 高DPI屏幕优化
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    },
    
    // 创建粒子系统
    createParticles() {
      this.particles = [];
      const count = this.isMobile() ? Math.floor(this.particleCount * 0.4) : this.particleCount;
      
      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle());
      }
    },
    
    // 创建单个粒子
    createParticle() {
      return {
        x: Math.random() * this.canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * this.canvas.height / (window.devicePixelRatio || 1),
        vx: (Math.random() - 0.5) * 0.5 * this.animationSpeed,
        vy: (Math.random() - 0.5) * 0.5 * this.animationSpeed,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: this.getRandomColor(),
        trail: []
      }
    },
    
    // 获取随机颜色（机甲主题色系）
    getRandomColor() {
      const colors = [
        'rgba(220, 20, 60, 0.8)',   // 机甲红
        'rgba(255, 215, 0, 0.6)',   // 金色
        'rgba(255, 69, 0, 0.7)',    // 橙红
        'rgba(255, 255, 255, 0.4)'  // 白色
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // 更新粒子位置
    updateParticles() {
      const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
      const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
      
      this.particles.forEach(particle => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // 边界检测和反弹
        if (particle.x <= 0 || particle.x >= canvasWidth) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvasWidth, particle.x));
        }
        if (particle.y <= 0 || particle.y >= canvasHeight) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvasHeight, particle.y));
        }
        
        // 鼠标交互效果
        if (this.mouseInteraction && this.mouse.active) {
          const dx = this.mouse.x - particle.x;
          const dy = this.mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx -= (dx / distance) * force * 0.02;
            particle.vy -= (dy / distance) * force * 0.02;
          }
        }
        
        // 记录轨迹
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 5) {
          particle.trail.shift();
        }
      });
    },
    
    // 绘制粒子
    drawParticles() {
      this.particles.forEach(particle => {
        // 绘制轨迹
        if (particle.trail.length > 1) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = particle.color.replace('0.8)', '0.2)').replace('0.6)', '0.2)').replace('0.7)', '0.2)');
          this.ctx.lineWidth = 0.5;
          
          for (let i = 1; i < particle.trail.length; i++) {
            this.ctx.moveTo(particle.trail[i - 1].x, particle.trail[i - 1].y);
            this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          this.ctx.stroke();
        }
        
        // 绘制粒子主体
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
        
        // 添加发光效果
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = particle.size * 2;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });
    },
    
    // 绘制粒子连线
    drawConnections() {
      if (!this.enableConnections) return;
      
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.3;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    },
    
    // 动画循环
    animate() {
      // 清除画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 更新和绘制粒子
      this.updateParticles();
      this.drawConnections();
      this.drawParticles();
      
      // 继续动画
      this.animationId = requestAnimationFrame(this.animate);
    },
    
    // 开始动画
    startAnimation() {
      this.animate();
    },
    
    // 停止动画
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    },
    
    // 绑定事件
    bindEvents() {
      window.addEventListener('resize', this.handleResize);
    },
    
    // 清理资源
    cleanup() {
      this.stopAnimation();
      window.removeEventListener('resize', this.handleResize);
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      
      this.resizeTimeout = setTimeout(() => {
        this.resizeCanvas();
        this.createParticles();
      }, 250);
    },
    
    // 处理鼠标移动
    handleMouseMove(event) {
      if (!this.mouseInteraction) return;
      
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = event.clientX - rect.left;
      this.mouse.y = event.clientY - rect.top;
      this.mouse.active = true;
    },
    
    // 处理鼠标离开
    handleMouseLeave() {
      this.mouse.active = false;
    },
    
    // 检测是否为移动设备
    isMobile() {
      return window.innerWidth <= 768;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/ironman-theme.scss';

.tech-particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.particle-canvas {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

// 科技网格背景
.tech-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

// 扫描线效果
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(220, 20, 60, 0.8) 50%, 
    transparent 100%);
  box-shadow: 0 0 10px rgba(220, 20, 60, 0.5);
}

.scan-line-1 {
  top: 20%;
  animation: scan-horizontal 4s linear infinite;
}

.scan-line-2 {
  top: 50%;
  animation: scan-horizontal 6s linear infinite reverse;
  animation-delay: 2s;
}

.scan-line-3 {
  top: 80%;
  animation: scan-horizontal 5s linear infinite;
  animation-delay: 4s;
}

@keyframes scan-horizontal {
  0% { transform: translateX(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}

// 角落科技装饰
.tech-corners {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(255, 215, 0, 0.6);
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: rgba(220, 20, 60, 0.8);
    box-shadow: 0 0 5px rgba(220, 20, 60, 0.5);
  }
  
  &::before {
    width: 20px;
    height: 2px;
  }
  
  &::after {
    width: 2px;
    height: 20px;
  }
}

.corner-tl {
  top: 20px;
  left: 20px;
  border-bottom: none;
  border-right: none;
  
  &::before {
    top: -2px;
    left: -2px;
  }
  
  &::after {
    top: -2px;
    left: -2px;
  }
}

.corner-tr {
  top: 20px;
  right: 20px;
  border-bottom: none;
  border-left: none;
  
  &::before {
    top: -2px;
    right: -2px;
  }
  
  &::after {
    top: -2px;
    right: -2px;
  }
}

.corner-bl {
  bottom: 20px;
  left: 20px;
  border-top: none;
  border-right: none;
  
  &::before {
    bottom: -2px;
    left: -2px;
  }
  
  &::after {
    bottom: -2px;
    left: -2px;
  }
}

.corner-br {
  bottom: 20px;
  right: 20px;
  border-top: none;
  border-left: none;
  
  &::before {
    bottom: -2px;
    right: -2px;
  }
  
  &::after {
    bottom: -2px;
    right: -2px;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .tech-grid {
    background-size: 30px 30px;
    opacity: 0.2;
  }
  
  .scan-line {
    height: 1px;
  }
  
  .corner {
    width: 40px;
    height: 40px;
    border-width: 1px;
  }
}

@media (max-width: 480px) {
  .tech-grid {
    opacity: 0.1;
  }
  
  .scan-lines {
    opacity: 0.5;
  }
  
  .tech-corners {
    opacity: 0.7;
  }
}
</style>