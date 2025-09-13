/**
 * 验证码输入组件
 * 包含验证码输入框和验证码图片显示功能
 */
import { RefreshCw, Shield } from "lucide-react";
import React from "react";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "../ui/input";

export interface CaptchaData {
  captchaId: string;
  captchaUrl: string;
}

export interface CaptchaInputProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  captchaData: CaptchaData | null;
  onRefreshCaptcha: () => void;
  disabled?: boolean;
  className?: string;
}

export const CaptchaInput: React.FC<CaptchaInputProps> = ({
  register,
  error,
  captchaData,
  onRefreshCaptcha,
  disabled = false,
  className = "",
}) => {
  console.log("[CaptchaInput] 渲染验证码输入组件", {
    disabled,
    hasError: !!error,
    hasCaptcha: !!captchaData?.captchaUrl,
  });

  const handleCaptchaClick = () => {
    console.log("[CaptchaInput] 点击刷新验证码");
    onRefreshCaptcha();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">验证码</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            {...register} 
            type="text" 
            placeholder="请输入验证码" 
            className="pl-10 h-11 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
            disabled={disabled} 
          />
        </div>
        <div className="relative">
          {captchaData?.captchaUrl ? (
            <img
              src={captchaData.captchaUrl}
              alt="验证码"
              className="h-11 w-28 object-cover rounded-lg cursor-pointer border-2 border-input hover:border-primary transition-all duration-200 shadow-sm"
              onClick={handleCaptchaClick}
            />
          ) : (
            <div
              className="h-11 w-28 bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/10 border-2 border-input hover:border-primary transition-all duration-200"
              onClick={handleCaptchaClick}
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-destructive font-medium">{error.message}</p>}
    </div>
  );
};
