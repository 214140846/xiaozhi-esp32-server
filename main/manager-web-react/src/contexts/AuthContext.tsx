/**
 * 认证上下文 - 管理用户认证状态和相关操作
 */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { authAPI, apiUtils } from '../lib/api';
import type { 
  AuthState, 
  AuthAction, 
  LoginForm, 
  PublicConfig 
} from '../types/auth';

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// 状态reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log(`[Auth Context] Action: ${action.type}`, action);
  
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    default:
      return state;
  }
};

// 上下文接口
interface AuthContextType {
  // 状态
  state: AuthState;
  
  // 操作
  login: (loginData: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // 公共配置相关
  publicConfig: PublicConfig | null;
  refreshPublicConfig: () => Promise<void>;
  
  // 验证码相关
  generateCaptcha: () => Promise<{ captchaId: string; captchaUrl: string }>;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider组件Props
interface AuthProviderProps {
  children: React.ReactNode;
}

// AuthProvider组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [publicConfig, setPublicConfig] = React.useState<PublicConfig | null>(null);

  // 从localStorage恢复认证状态
  useEffect(() => {
    console.log('[Auth Context] 初始化认证状态');
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        const parsedToken = typeof token === 'string' ? JSON.parse(token) : token;
        const parsedUser = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
        
        console.log('[Auth Context] 恢复认证状态', { user: parsedUser });
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: parsedUser,
            token: parsedToken,
          },
        });
      } catch (error) {
        console.error('[Auth Context] 恢复认证状态失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  // 获取公共配置
  const refreshPublicConfig = useCallback(async () => {
    console.log('[Auth Context] 获取公共配置');
    try {
      const response = await authAPI.getPublicConfig();
      console.log('[Auth Context] 公共配置获取成功:', response.data);
      setPublicConfig(response.data);
    } catch (error: any) {
      console.error('[Auth Context] 获取公共配置失败:', error);
      // 设置默认配置
      setPublicConfig({
        allowUserRegister: false,
        enableMobileRegister: false,
        mobileAreaList: [
          { key: '+86', name: '中国大陆' },
          { key: '+852', name: '香港' },
          { key: '+853', name: '澳门' },
          { key: '+886', name: '台湾' },
        ],
      });
    }
  }, []);

  // 初始化时获取公共配置
  useEffect(() => {
    refreshPublicConfig();
  }, [refreshPublicConfig]);

  // 生成验证码
  const generateCaptcha = useCallback(async (): Promise<{ captchaId: string; captchaUrl: string }> => {
    console.log('[Auth Context] 生成验证码');
    const captchaId = apiUtils.generateUUID();
    
    try {
      const blob = await authAPI.getCaptcha(captchaId);
      const captchaUrl = apiUtils.createBlobUrl(blob);
      console.log('[Auth Context] 验证码生成成功');
      return { captchaId, captchaUrl };
    } catch (error) {
      console.error('[Auth Context] 验证码生成失败:', error);
      throw error;
    }
  }, []);

  // 登录函数
  const login = useCallback(async (loginData: LoginForm) => {
    console.log('[Auth Context] 开始登录流程');
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.login(loginData);
      
      if (response.status === 200 && response.data) {
        const { token, userInfo } = response.data;
        
        // 存储到localStorage
        localStorage.setItem('token', JSON.stringify(token));
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        console.log('[Auth Context] 登录成功', { user: userInfo });
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userInfo,
            token: token,
          },
        });
      } else {
        throw new Error(response.msg || '登录失败');
      }
    } catch (error: any) {
      console.error('[Auth Context] 登录失败:', error);
      const errorMessage = error.response?.data?.msg || error.message || '登录失败，请重试';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  // 登出函数
  const logout = useCallback(async () => {
    console.log('[Auth Context] 开始登出流程');
    
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('[Auth Context] 登出API调用失败:', error);
      // 即使API调用失败，也要清理本地状态
    }
    
    // 清理localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    console.log('[Auth Context] 登出完成');
    dispatch({ type: 'LOGOUT' });
  }, []);

  // 清理错误
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // 上下文值
  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    clearError,
    publicConfig,
    refreshPublicConfig,
    generateCaptcha,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;