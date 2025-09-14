/**
 * 登录表单主组件
 * 整合各个子组件，处理表单逻辑和状态管理
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { LoginType, type LoginTypeValue } from '../../types/auth';
import { apiUtils } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useBlobCaptcha } from '../../hooks/auth/useBlobCaptcha';
import { Link } from 'react-router-dom';
import { useUserLoginLoginMutation, useUserPubConfigPubConfigQuery } from '../../hooks/user/generatedHooks';

// 导入子组件
import { ErrorDisplay } from './ErrorDisplay';
import { UsernameInput } from './UsernameInput';
import { MobileInput } from './MobileInput';
import { PasswordInput } from './PasswordInput';
import { CaptchaInput } from './CaptchaInput';
import { LoginTypeSwitch } from './LoginTypeSwitch';

// 表单验证schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名/手机号不能为空'),
  password: z.string().min(1, '密码不能为空'),
  captcha: z.string().min(1, '验证码不能为空'),
  mobile: z.string().default(''),
  areaCode: z.string().default('+86'),
});

// type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess,
  className = '' 
}) => {
  const [loginType, setLoginType] = useState<LoginTypeValue>(LoginType.USERNAME);
  const hasInitRef = React.useRef(false);
  
  // 使用新的 Hooks
  const { applyLogin, generateCaptcha } = useAuth();
  const { data: pubRes } = useUserPubConfigPubConfigQuery();
  const publicConfig = (pubRes?.data as any) || {};
  // Captcha（统一复用自定义钩子）
  const { captchaData, captchaLoading, refreshCaptcha } = useBlobCaptcha();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const loginMutation = useUserLoginLoginMutation();
  
  // 初始化时仅执行一次的验证码拉取
  const initCaptchaOnce = React.useCallback(() => {
    if (!hasInitRef.current) {
      refreshCaptcha();
      hasInitRef.current = true;
    }
  }, [refreshCaptcha]);
  
  // 根据公共配置初始化默认登录方式（仅初始化一次）
  React.useEffect(() => {
    if (publicConfig) {
      const defaultType = publicConfig.enableMobileRegister ? LoginType.MOBILE : LoginType.USERNAME;
      if (loginType !== defaultType) {
        setLoginType(defaultType);
      }
      // 确保初始化时获取一次验证码
      initCaptchaOnce();
    }
  }, [publicConfig, loginType, initCaptchaOnce]);

  // 如果公共配置较慢，也在首次渲染时拉取一次验证码
  React.useEffect(() => {
    initCaptchaOnce();
  }, [initCaptchaOnce]);
  
  const isLoading = useMemo(() => loginMutation.isPending || captchaLoading, [loginMutation.isPending, captchaLoading]);
  console.log('[LoginForm] 组件渲染', { loginType, isLoading, hasCaptcha: !!captchaData });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      captcha: '',
      mobile: '',
      areaCode: '+86',
    },
  });

  const areaCode = watch('areaCode');

  // 切换登录方式
  const handleLoginTypeSwitch = useCallback((type: LoginTypeValue) => {
    console.log(`[LoginForm] 切换登录方式: ${type}`);
    setLoginType(type);
    
    // 清空表单
    reset({
      username: '',
      password: '',
      captcha: '',
      mobile: '',
      areaCode: areaCode,
    });
    
    // 刷新验证码
    refreshCaptcha();
  }, [reset, areaCode, refreshCaptcha]);

  // 表单提交
  const onSubmit = useCallback(async (data: any) => {
    console.log('[LoginForm] 表单提交', { loginType, data: { ...data, password: '***' } });
    
    try {
      // 构建登录数据
      const loginData = {
        username: loginType === LoginType.MOBILE ? `${data.areaCode}${data.mobile}` : data.username,
        password: data.password,
        captcha: data.captcha,
        captchaId: captchaData?.captchaId || '',
        areaCode: data.areaCode,
        mobile: data.mobile || '',
      };

      // 手机号验证
      if (loginType === LoginType.MOBILE) {
        if (!apiUtils.validateMobile(data.mobile || '', data.areaCode)) {
          throw new Error('请输入正确的手机号码');
        }
      }

      setErrorMessage(null);
      const res: any = await loginMutation.mutateAsync({ data: loginData });
      // 兼容 code/msg/data 结构
      if (res?.code === 0 && res?.data?.token) {
        const token: string = res.data.token;
        localStorage.setItem('token', token);
        applyLogin(token);
        console.log('[LoginForm] 登录成功，触发上层 onSuccess 回调');
        onSuccess?.();
      } else {
        const msg = res?.msg || '登录失败，请重试';
        setErrorMessage(msg);
        throw new Error(msg);
      }
      
    } catch (error: any) {
      console.error('[LoginForm] 登录失败:', error);
      const msg = error?.response?.data?.msg || error?.message || '登录失败，请重试';
      setErrorMessage(msg);
      
      // 如果是验证码错误，刷新验证码
      if (msg.includes('验证码')) {
        refreshCaptcha();
      }
    }
  }, [loginType, loginMutation, onSuccess, captchaData?.captchaId, refreshCaptcha, applyLogin]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 错误信息显示 */}
      <ErrorDisplay error={errorMessage} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* 用户名/手机号输入 */}
        {loginType === LoginType.USERNAME ? (
          <UsernameInput
            register={register('username')}
            error={errors.username}
            disabled={isLoading}
          />
        ) : (
          <MobileInput
            mobileRegister={register('mobile')}
            mobileError={errors.mobile}
            areaCode={areaCode || '+86'}
            setValue={setValue}
            mobileAreaList={publicConfig?.mobileAreaList || []}
            disabled={isLoading}
          />
        )}

        {/* 密码输入 */}
        <PasswordInput
          register={register('password')}
          error={errors.password}
          disabled={isLoading}
        />

        {/* 验证码输入 */}
        <CaptchaInput
          register={register('captcha')}
          error={errors.captcha}
          captchaData={captchaData}
          onRefreshCaptcha={refreshCaptcha}
          disabled={isLoading}
        />

        {/* 登录按钮 */}
        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              登录中...
            </div>
          ) : (
            '登录'
          )}
        </Button>

        {/* 登录方式切换 */}
        {publicConfig?.enableMobileRegister && (
          <LoginTypeSwitch
            currentLoginType={loginType}
            onLoginTypeChange={handleLoginTypeSwitch}
            disabled={isLoading}
          />
        )}

        {/* 功能链接 */}
        <div className="flex justify-between text-sm pt-2">
          {publicConfig?.allowUserRegister && (
            <Link
              to="/register"
              aria-disabled={isLoading}
              className={`text-primary hover:text-primary/80 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/5 ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            >
              新用户注册
            </Link>
          )}
          {publicConfig?.enableMobileRegister && (
            <Link
              to="/retrieve-password"
              aria-disabled={isLoading}
              className={`text-primary hover:text-primary/80 font-medium transition-colors duration-200 px-2 py-1 rounded-md hover:bg-primary/5 ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            >
              忘记密码?
            </Link>
          )}
        </div>



        {/* 用户协议 */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/30">
          登录即同意{' '}
          <button 
            type="button" 
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors duration-200"
          >
            《用户协议》
          </button>
          {' '}和{' '}
          <button 
            type="button" 
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors duration-200"
          >
            《隐私政策》
          </button>
        </div>
      </form>
    </div>
  );
};
