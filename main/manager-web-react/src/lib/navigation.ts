import type { NavigateFunction, To } from 'react-router-dom';

let navigatorRef: NavigateFunction | null = null;

export const setNavigator = (navigate: NavigateFunction) => {
  navigatorRef = navigate;
};

export const navigate = (to: To, options?: { replace?: boolean; state?: any }) => {
  if (navigatorRef) {
    navigatorRef(to, options);
  } else {
    // Fallback：在路由器尚未就绪时退回到硬跳转
    if (typeof to === 'string') {
      window.location.href = to;
    } else if (typeof to === 'number') {
      window.history.go(to);
    } else {
      try {
        // @ts-ignore
        window.location.href = String(to);
      } catch {
        window.location.href = '/';
      }
    }
  }
};

