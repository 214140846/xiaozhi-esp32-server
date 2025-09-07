<template>
  <div ref="container" :class="className" :style="style" class="relative"></div>
</template>

<script>
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uIntensity;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = rampColor;
  
  float finalAlpha = auroraAlpha * smoothstep(0.0, 0.5, intensity) * uIntensity;
  
  fragColor = vec4(auroraColor * finalAlpha, finalAlpha);
}
`

export default {
  name: 'Aurora',
  props: {
    colorStops: { type: Array, default: () => ['#7cff67', '#171D22', '#7cff67'] },
    amplitude: { type: Number, default: 1.0 },
    blend: { type: Number, default: 0.5 },
    time: { type: Number, default: null },
    speed: { type: Number, default: 1.0 },
    intensity: { type: Number, default: 1.0 },
    className: { type: String, default: '' },
    style: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      _renderer: null,
      _gl: null,
      _program: null,
      _mesh: null,
      _animateId: 0,
      _resizeHandler: null,
    }
  },
  mounted() {
    this.initAurora()
  },
  beforeDestroy() {
    this.cleanup()
  },
  watch: {
    amplitude() { this.reinit() },
    intensity() { this.reinit() },
  },
  methods: {
    reinit() {
      this.cleanup()
      this.initAurora()
    },
    _parentWidth(container) {
      return (container.parentElement && container.parentElement.offsetWidth) || container.offsetWidth || window.innerWidth
    },
    _parentHeight(container) {
      return (container.parentElement && container.parentElement.offsetHeight) || container.offsetHeight || window.innerHeight
    },
    initAurora() {
      const container = this.$refs.container
      if (!container) return

      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
      })
      this._renderer = renderer

      const gl = renderer.gl
      this._gl = gl
      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.canvas.style.backgroundColor = 'transparent'

      const geometry = new Triangle(gl)
      if (geometry.attributes.uv) {
        delete geometry.attributes.uv
      }

      const colorStopsArray = (this.colorStops && this.colorStops.length ? this.colorStops : ['#7cff67', '#171D22', '#7cff67']).map(hex => {
        const c = new Color(hex)
        return [c.r, c.g, c.b]
      })

      const program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: this.amplitude },
          uColorStops: { value: colorStopsArray },
          uResolution: { value: [Math.max(this._parentWidth(container), 300), Math.max(this._parentHeight(container), 300)] },
          uBlend: { value: this.blend },
          uIntensity: { value: this.intensity },
        },
      })
      this._program = program

      const mesh = new Mesh(gl, { geometry, program })
      this._mesh = mesh

      container.appendChild(gl.canvas)
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.canvas.style.display = 'block'
      gl.canvas.style.position = 'absolute'
      gl.canvas.style.top = '0'
      gl.canvas.style.left = '0'

      const resize = () => {
        if (!this._renderer || !this._program) return
        const w = Math.max(this._parentWidth(container), 300)
        const h = Math.max(this._parentHeight(container), 300)
        this._renderer.setSize(w, h)
        this._program.uniforms.uResolution.value = [w, h]
      }
      this._resizeHandler = resize
      window.addEventListener('resize', resize)
      resize()

      const update = (t) => {
        this._animateId = requestAnimationFrame(update)
        if (!this._renderer || !this._program || !this._mesh) return

        const time = this.time != null ? this.time : t * 0.01
        const speed = this.speed != null ? this.speed : 1.0

        this._program.uniforms.uTime.value = time * speed * 0.1
        this._program.uniforms.uAmplitude.value = this.amplitude != null ? this.amplitude : 1.0
        this._program.uniforms.uBlend.value = this.blend != null ? this.blend : 0.5
        this._program.uniforms.uIntensity.value = this.intensity != null ? this.intensity : 1.0

        const stops = (this.colorStops && this.colorStops.length ? this.colorStops : ['#27FF64', '#7cff67', '#27FF64'])
        this._program.uniforms.uColorStops.value = stops.map(hex => {
          const c = new Color(hex)
          return [c.r, c.g, c.b]
        })

        this._renderer.render({ scene: this._mesh })
      }

      this._animateId = requestAnimationFrame(update)
    },
    cleanup() {
      if (this._animateId) {
        cancelAnimationFrame(this._animateId)
        this._animateId = 0
      }
      if (this._resizeHandler) {
        window.removeEventListener('resize', this._resizeHandler)
        this._resizeHandler = null
      }
      if (this._renderer) {
        const gl = this._renderer.gl
        const container = this.$refs.container
        if (container && gl.canvas.parentNode === container) {
          container.removeChild(gl.canvas)
        }
        const lose = gl.getExtension('WEBGL_lose_context')
        if (lose) lose.loseContext()
      }
      this._mesh = null
      this._program = null
      this._gl = null
      this._renderer = null
    },
  },
}
</script>

<style scoped>
div {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

::v-deep canvas {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
