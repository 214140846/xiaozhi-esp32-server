/**
 * 找回密码表单组件
 * 通过手机号+短信验证码重置密码
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { authAPI, apiUtils } from '../../lib/api';
import { usePublicConfig } from '../../hooks/usePublicConfig';
import { useCaptcha } from '../../hooks/useCaptcha';
import type { RetrievePasswordForm as RetrievePasswordFormData } from '../../types/auth';
import { Phone, Lock, Shield, RefreshCw, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RetrievePasswordFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const RetrievePasswordForm: React.FC<RetrievePasswordFormProps> = ({ onSuccess, className }) => {
  const navigate = useNavigate();
  const { data: publicConfig, isLoading: configLoading } = usePublicConfig();
  
  // 短信验证码倒计时
  const [countdown, setCountdown] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // 验证码相关
  const { captchaData, refreshCaptcha, isLoading: captchaLoading } = useCaptcha();

  // 表单管理
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RetrievePasswordFormData>({
    defaultValues: {
      areaCode: '+86',
      mobile: '',
      captcha: '',
      captchaId: '',
      mobileCaptcha: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const watchedValues = watch();

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

  // 找回密码mutation
  const retrievePasswordMutation = useMutation({
    mutationFn: authAPI.retrievePassword,
    onSuccess: (data) => {
      console.log('[RetrievePasswordForm] 密码重置成功:', data);
      alert('密码重置成功！');
      onSuccess?.();
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('[RetrievePasswordForm] 密码重置失败:', error);
      const errorMessage = error.response?.data?.msg || '重置失败，请重试';
      alert(errorMessage);
      
      // 如果是验证码错误，刷新验证码
      if (errorMessage.includes('验证码')) {
        refreshCaptcha();
      }
    }
  });

  // 发送短信验证码mutation
  const sendSmsMutation = useMutation({
    mutationFn: authAPI.sendSmsVerification,
    onSuccess: () => {
      console.log('[RetrievePasswordForm] 短信验证码发送成功');
      alert('验证码发送成功');
      startCountdown();
    },
    onError: (error: any) => {
      console.error('[RetrievePasswordForm] 短信验证码发送失败:', error);
      const errorMessage = error.response?.data?.msg || '验证码发送失败';
      alert(errorMessage);
      
      // 如果是验证码错误，刷新验证码
      if (errorMessage.includes('验证码')) {
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
      refreshCaptcha();
      return;
    }

    await sendSmsMutation.mutateAsync({
      phone: areaCode + mobile,
      captcha,
      captchaId
    });
  }, [watchedValues, sendSmsMutation, refreshCaptcha]);

  // 表单提交
  const onSubmit = useCallback(async (data: RetrievePasswordFormData) => {
    console.log('[RetrievePasswordForm] 提交找回密码表单:', data);

    // 验证手机号
    if (!apiUtils.validateMobile(data.mobile, data.areaCode)) {
      alert('请输入正确的手机号码');
      return;
    }

    // 验证图形验证码
    if (!data.captcha?.trim()) {
      alert('请输入图形验证码');
      refreshCaptcha();
      return;
    }

    // 验证短信验证码
    if (!data.mobileCaptcha?.trim()) {
      alert('请输入短信验证码');
      return;
    }

    // 验证新密码
    if (!data.newPassword?.trim()) {
      alert('新密码不能为空');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }

    await retrievePasswordMutation.mutateAsync(data);
  }, [retrievePasswordMutation, refreshCaptcha]);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {/* 手机号输入 */}
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
              )) || [
                <SelectItem key="+86" value="+86">中国 (+86)</SelectItem>
              ]}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register('mobile', { 
                required: true,
                validate: (value) => apiUtils.validateMobile(value, watchedValues.areaCode) || '请输入正确的手机号码'
              })}
              type="tel"
              placeholder="请输入手机号码"
              className="pl-10"
              disabled={retrievePasswordMutation.isPending}
            />
          </div>
        </div>
        {errors.mobile && (
          <p className="text-sm text-red-500">{errors.mobile.message || '请输入正确的手机号码'}</p>
        )}
      </div>

      {/* 图形验证码 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">图形验证码</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register('captcha', { required: '请输入图形验证码' })}
              type="text"
              placeholder="请输入验证码"
              className="pl-10"
              disabled={retrievePasswordMutation.isPending}
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
        {errors.captcha && (
          <p className="text-sm text-red-500">{errors.captcha.message}</p>
        )}
      </div>

      {/* 手机验证码 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">手机验证码</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register('mobileCaptcha', { required: '请输入手机验证码' })}
              type="text"
              placeholder="请输入手机验证码"
              className="pl-10"
              maxLength={6}
              disabled={retrievePasswordMutation.isPending}
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
        {errors.mobileCaptcha && (
          <p className="text-sm text-red-500">{errors.mobileCaptcha.message}</p>
        )}
      </div>

      {/* 新密码输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">新密码</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            {...register('newPassword', { required: '新密码不能为空' })}
            type="password"
            placeholder="请输入新密码"
            className="pl-10"
            disabled={retrievePasswordMutation.isPending}
          />
        </div>
        {errors.newPassword && (
          <p className="text-sm text-red-500">{errors.newPassword.message}</p>
        )}
      </div>

      {/* 确认新密码输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-card-foreground">确认新密码</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            {...register('confirmPassword', { 
              required: '请确认新密码',
              validate: (value) => value === watchedValues.newPassword || '两次输入的密码不一致'
            })}
            type="password"
            placeholder="请确认新密码"
            className="pl-10"
            disabled={retrievePasswordMutation.isPending}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* 提交按钮 */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        disabled={retrievePasswordMutation.isPending}
      >
        {retrievePasswordMutation.isPending ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            重置中...
          </>
        ) : (
          '立即重置'
        )}
      </Button>
    </form>
  );
};