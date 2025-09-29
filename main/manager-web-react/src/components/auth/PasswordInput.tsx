/**
 * 密码输入组件
 * 支持显示/隐藏密码功能
 */
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "../ui/input";

export interface PasswordInputProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  register,
  error,
  disabled = false,
  placeholder = "请输入密码",
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  console.log("[PasswordInput] 渲染密码输入组件", { disabled, hasError: !!error });

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">密码</label>
      <div className="relative">
        <Input
          {...register}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10 h-11 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          aria-invalid={!!error}
          aria-describedby={error ? `${register.name}-error` : undefined}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
          disabled={disabled}
          aria-label={showPassword ? "隐藏密码" : "显示密码"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id={`${register.name}-error`} role="alert" className="text-sm text-destructive font-medium">{error.message}</p>
      )}
    </div>
  );
};
