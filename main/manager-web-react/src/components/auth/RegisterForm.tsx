/**
 * 注册表单组件
 * 支持用户名注册和手机号注册两种模式
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiUtils } from '../../lib/api';
import { useUserRegisterRegisterMutation, useUserSmsVerificationSmsVerificationMutation } from '../../hooks/user/generatedHooks';
import { useUserPubConfigPubConfigQuery } from '../../hooks/user/generatedHooks';
import type { RegisterForm as RegisterFormData } from '../../types/auth';
import { User, Phone, Lock, Shield, RefreshCw, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBlobCaptcha } from '../../hooks/auth/useBlobCaptcha';

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, className }) => {
  const navigate = useNavigate();
  const { data: pubRes } = useUserPubConfigPubConfigQuery();
  const publicConfig: any = (pubRes?.data as any) || {};
  const configLoading = false;
  
  // 检查是否允许注册，如果不允许则重定向到登录页
  useEffect(() => {
    if (!configLoading && publicConfig && !publicConfig.allowUserRegister) {
      console.log('[RegisterForm] 当前不允许普通用户注册，自动重定向到登录页');
      alert('当前不允许普通用户注册');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
  }, [publicConfig, configLoading, navigate]);
  
  // 短信验证码倒计时
  const [countdown, setCountdown] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // 验证码相关（使用 blob -> objectURL 显示，与登录页一致）
  const { captchaData, captchaLoading, refreshCaptcha } = useBlobCaptcha();

  // 表单管理
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      captcha: '',
      captchaId: '',
      areaCode: '+86',
      mobile: '',
      mobileCaptcha: ''
    }
  });

  const watchedValues = watch();
  const watchPassword = watch('password');
  const watchConfirmPassword = watch('confirmPassword');

  // 设置验证码ID
  useEffect(() => {
    if (captchaData?.captchaId) {
      setValue('captchaId', captchaData.captchaId);
    }
  }, [captchaData?.captchaId, setValue]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);

  // 注册mutation
  const registerMutation = useUserRegisterRegisterMutation({
    onSuccess: (res: any) => {
      if (res?.code === 0) {
        console.log('[RegisterForm] 注册成功:', res);
        alert('注册成功！');
        onSuccess?.();
        navigate('/login');
      } else {
        const msg = res?.msg || '注册失败，请重试';
        alert(msg);
      }
    },
    onError: (error: any) => {
      console.error('[RegisterForm] 注册失败:', error);
      const errorMessage = error?.response?.data?.msg || error?.message || '注册失败，请重试';
      alert(errorMessage);
      if (errorMessage.includes('图形验证码')) {
        setValue('captcha', '');
        refreshCaptcha();
      }
    }
  });

  // 发送短信验证码mutation
  const sendSmsMutation = useUserSmsVerificationSmsVerificationMutation({
    onSuccess: (res: any) => {
      if (res?.code === 0) {
        console.log('[RegisterForm] 短信验证码发送成功');
        alert('验证码发送成功');
        startCountdown();
      } else {
        const msg = res?.msg || '验证码发送失败';
        alert(msg);
      }
    },
    onError: (error: any) => {
      console.error('[RegisterForm] 短信验证码发送失败:', error);
      const errorMessage = error?.response?.data?.msg || error?.message || '验证码发送失败';
      alert(errorMessage);
      setCountdown(0);
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      if (errorMessage.includes('图形验证码')) {
        setValue('captcha', '');
        refreshCaptcha();
      }
    }
  });

  // 开始倒计时
  const startCountdown = useCallback(() => {
    setCountdown(60);
    const newTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          setTimer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  }, []);

  // 发送短信验证码
  const handleSendSms = useCallback(async () => {
    const { mobile, areaCode, captcha, captchaId } = watchedValues;
    
    // 验证手机号
    if (!apiUtils.validateMobile(mobile, areaCode)) {
      alert('请输入正确的手机号码');
      return;
    }

    // 验证图形验证码
    if (!captcha?.trim()) {
      alert('请输入图形验证码');
      return;
    }

    await sendSmsMutation.mutateAsync({ data: { phone: areaCode + mobile, captcha, captchaId } });
  }, [watchedValues, sendSmsMutation, refreshCaptcha]);

  // 表单提交
  const onSubmit = useCallback(async (data: RegisterFormData) => {
    console.log('[RegisterForm] 提交注册表单:', data);

    // 根据注册模式选择验证逻辑
    if (publicConfig?.enableMobileRegister) {
      // 手机号注册验证
      if (!apiUtils.validateMobile(data.mobile, data.areaCode)) {
        alert('请输入正确的手机号码');
        return;
      }
      if (!data.mobileCaptcha?.trim()) {
        alert('请输入手机验证码');
        return;
      }
      // 设置用户名为手机号
      data.username = data.areaCode + data.mobile;
    } else {
      // 用户名注册验证
      if (!data.username?.trim()) {
        alert('用户名不能为空');
        return;
      }
    }

    // 验证密码
    if (!data.password?.trim()) {
      alert('密码不能为空');
      return;
    }
    if (data.password !== data.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    // 验证图形验证码
    if (!data.captcha?.trim()) {
      alert('验证码不能为空');
      return;
    }

    await registerMutation.mutateAsync({ data });
  }, [publicConfig, registerMutation, refreshCaptcha]);

  // 键盘事件处理 - 回车键提交表单
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  }, [handleSubmit, onSubmit]);

  // 添加全局键盘事件监听
  useEffect(() => {
    document.addEventListener('keyup', handleKeyPress);
    return () => {
      document.removeEventListener('keyup', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 判断是否可以发送短信验证码
  const canSendSms = countdown === 0 && 
    apiUtils.validateMobile(watchedValues.mobile, watchedValues.areaCode) && 
    !sendSmsMutation.isPending;

  if (configLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">加载配置中...</span>
      </div>
    );
  }

  // 如果不允许注册，显示提示
  if (!publicConfig?.allowUserRegister) {
    return (
      <div className="text-center p-8">
        <div className="text-muted-foreground mb-4">当前不允许用户注册</div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/login')}
          className="w-full"
        >
          返回登录
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {/* 用户名输入 - 仅在非手机号注册模式显示 */}
      {!publicConfig?.enableMobileRegister && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">用户名</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register('username', { required: !publicConfig?.enableMobileRegister })}
              type="text"
              placeholder="请输入用户名"
              className="pl-10"
              disabled={registerMutation.isPending}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-500">用户名不能为空</p>
          )}
        </div>
      )}

      {/* 手机号输入 - 仅在手机号注册模式显示 */}
      {publicConfig?.enableMobileRegister && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">手机号</label>
          <div className="flex gap-2">
            <Select 
              value={watchedValues.areaCode} 
              onValueChange={(value) => setValue('areaCode', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {publicConfig?.mobileAreaList?.map((area: any) => (
                  <SelectItem key={area.key} value={area.key}>
                    {area.name} ({area.key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('mobile', { required: publicConfig?.enableMobileRegister })}
                type="tel"
                placeholder="请输入手机号码"
                className="pl-10"
                disabled={registerMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* 图形验证码 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">图形验证码</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register('captcha', { required: true })}
              type="text"
              placeholder="请输入验证码"
              className="pl-10"
              disabled={registerMutation.isPending}
            />
          </div>
          <div 
            className="w-32 h-10 border rounded-md cursor-pointer flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
            onClick={refreshCaptcha}
          >
            {captchaLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : captchaData?.captchaUrl ? (
              <img 
                src={captchaData.captchaUrl} 
                alt="验证码" 
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <span className="text-xs text-muted-foreground">点击获取</span>
            )}
          </div>
        </div>
      </div>

      {/* 手机验证码 - 仅在手机号注册模式显示 */}
      {publicConfig?.enableMobileRegister && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">手机验证码</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('mobileCaptcha', { required: publicConfig?.enableMobileRegister })}
                type="text"
                placeholder="请输入手机验证码"
                className="pl-10"
                maxLength={6}
                disabled={registerMutation.isPending}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="px-4 whitespace-nowrap"
              disabled={!canSendSms}
              onClick={handleSendSms}
            >
              <Send className="w-4 h-4 mr-1" />
              {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
            </Button>
          </div>
        </div>
      )}

      {/* 密码输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">密码</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            {...register('password', { required: true })}
            type="password"
            placeholder="请输入密码"
            className="pl-10"
            disabled={registerMutation.isPending}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">密码不能为空</p>
        )}
      </div>

      {/* 确认密码输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">确认密码</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            {...register('confirmPassword', { required: true })}
            type="password"
            placeholder="请确认密码"
            className="pl-10"
            disabled={registerMutation.isPending}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">请确认密码</p>
        )}
        {/* 实时密码匹配提示 */}
        {watchPassword && watchConfirmPassword && watchPassword !== watchConfirmPassword && (
          <p className="text-sm text-red-500">两次输入的密码不一致</p>
        )}
        {watchPassword && watchConfirmPassword && watchPassword === watchConfirmPassword && watchConfirmPassword.length > 0 && (
          <p className="text-sm text-green-500">密码匹配</p>
        )}
      </div>

      {/* 提交按钮 */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            注册中...
          </>
        ) : (
          '立即注册'
        )}
      </Button>
    </form>
  );
};
