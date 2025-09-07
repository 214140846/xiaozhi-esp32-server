import ElementUI from 'element-ui';
// 导入ElementUI暗黑科技紫主题 (替代默认主题)
import './styles/element-ui-dark.scss';
import 'normalize.css/normalize.css'; // A modern alternative to CSS resets
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './styles/global.scss';
import { register as registerServiceWorker } from './registerServiceWorker';

Vue.use(ElementUI);

Vue.config.productionTip = false

// 注册Service Worker
registerServiceWorker();

// 创建Vue实例
new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
