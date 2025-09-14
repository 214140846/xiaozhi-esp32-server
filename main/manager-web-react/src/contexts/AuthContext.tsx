/**
 * 认证上下文 - 管理用户认证状态和相关操作
 */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { apiUtils, authAPI } from '../lib/api';
import { useUserInfoInfoQuery, useUserPubConfigPubConfigQuery } from '../hooks/user/generatedHooks';

// 类型定义
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: any | null; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string | null }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: any | null };

export interface PublicConfig {
  [key: string]: any;
}

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
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
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
  // 外部已通过接口完成登录，这里只负责落盘并更新状态
  applyLogin: (token: string, user?: any) => void;
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

  // 公共配置（使用 user hooks 获取）
  const defaultPublicConfig: PublicConfig = {
    allowUserRegister: false,
    enableMobileRegister: false,
    mobileAreaList: [
      { key: '+86', name: '中国大陆' },
      { key: '+852', name: '香港' },
      { key: '+853', name: '澳门' },
      { key: '+886', name: '台湾' },
    ],
  };
  const pubConfigQuery = useUserPubConfigPubConfigQuery({}, undefined, {});
  useEffect(() => {
    if (pubConfigQuery.isSuccess) {
      const data: any = (pubConfigQuery.data as any)?.data ?? null;
      setPublicConfig(data || defaultPublicConfig);
    }
    if (pubConfigQuery.isError && !publicConfig) {
      setPublicConfig(defaultPublicConfig);
    }
  }, [pubConfigQuery.isSuccess, pubConfigQuery.isError, pubConfigQuery.data]);

  // 从localStorage恢复认证状态
  useEffect(() => {
    console.log('[Auth Context] 初始化认证状态');
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');

    if (token) {
      let parsedUser: any = null;
      try {
        parsedUser = userInfo ? JSON.parse(userInfo) : null;
      } catch {
        parsedUser = null;
        localStorage.removeItem('userInfo');
      }

      console.log('[Auth Context] 恢复认证状态', { hasToken: true });
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: parsedUser,
          token: token,
        },
      });
    }
  }, []);

  // 获取公共配置（触发 refetch）
  const refreshPublicConfig = useCallback(async () => {
    console.log('[Auth Context] 获取公共配置 (refetch)');
    try {
      await pubConfigQuery.refetch();
    } catch (error: any) {
      console.error('[Auth Context] 获取公共配置失败:', error);
      setPublicConfig(defaultPublicConfig);
    }
  }, [pubConfigQuery]);

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
      const captchaUrl = URL.createObjectURL(blob);
      console.log('[Auth Context] 验证码生成成功');
      return { captchaId, captchaUrl };
    } catch (error) {
      console.error('[Auth Context] 验证码生成失败:', error);
      throw error as any;
    }
  }, []);

  // 外部已完成登录调用后，统一在这里写入 token/用户信息并更新状态
  const applyLogin = useCallback((token: string, user?: any) => {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    }

    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: user || null, token } });
  }, []);

  // 登出函数
  const logout = useCallback(async () => {
    console.log('[Auth Context] 开始登出流程');
    // 后端若需要，可在调用处触发具体登出 API
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
    applyLogin,
    logout,
    clearError,
    publicConfig,
    refreshPublicConfig,
    generateCaptcha,
  };

  // 登录后自动获取用户信息（使用 hooks，若本地无用户信息）
  useUserInfoInfoQuery(
    {},
    undefined,
    {
      enabled: state.isAuthenticated && !state.user && !!state.token,
      onSuccess: (res: any) => {
        try {
          if (res?.code === 0 && res?.data) {
            localStorage.setItem('userInfo', JSON.stringify(res.data));
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data, token: state.token as any } });
          }
        } catch (e) {
          console.error('[Auth Context] 处理用户信息失败:', e);
        }
      },
      onError: (e: any) => {
        console.error('[Auth Context] 获取用户信息失败:', e);
      },
    }
  );

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
