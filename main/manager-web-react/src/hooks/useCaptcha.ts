/**
 * 验证码管理Hook
 */
import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authAPI, apiUtils } from '../lib/api';

interface CaptchaData {
  captchaId: string;
  captchaUrl: string;
}

export const useCaptcha = () => {
  const [captchaData, setCaptchaData] = useState<CaptchaData | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // 清理旧的Blob URL
  const cleanupUrl = useCallback((url: string) => {
    try {
      apiUtils.revokeBlobUrl(url);
    } catch (error) {
      console.warn('[useCaptcha] 清理Blob URL失败:', error);
    }
  }, []);

  // 生成验证码的mutation
  const generateCaptchaMutation = useMutation({
    mutationFn: async (): Promise<CaptchaData> => {
      console.log('[useCaptcha] 生成新验证码');
      const captchaId = apiUtils.generateUUID();
      
      const blob = await authAPI.getCaptcha(captchaId);
      const captchaUrl = apiUtils.createBlobUrl(blob);
      
      return { captchaId, captchaUrl };
    },
    onSuccess: (data) => {
      console.log('[useCaptcha] 验证码生成成功');
      
      // 清理旧的URL
      if (currentUrlRef.current) {
        cleanupUrl(currentUrlRef.current);
      }
      
      // 更新状态
      setCaptchaData(data);
      currentUrlRef.current = data.captchaUrl;
    },
    onError: (error) => {
      console.error('[useCaptcha] 验证码生成失败:', error);
    },
  });

  // 刷新验证码
  const refreshCaptcha = useCallback(() => {
    generateCaptchaMutation.mutate();
  }, [generateCaptchaMutation]);

  // 清理函数
  const cleanup = useCallback(() => {
    if (currentUrlRef.current) {
      cleanupUrl(currentUrlRef.current);
      currentUrlRef.current = null;
      setCaptchaData(null);
    }
  }, [cleanupUrl]);

  return {
    captchaData,
    refreshCaptcha,
    cleanup,
    isLoading: generateCaptchaMutation.isPending,
    error: generateCaptchaMutation.error,
  };
};