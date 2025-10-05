/*
 * @Author: yuyuhailian 1411102347@qq.com
 * @Date: 2025-09-28 23:38:19
 * @LastEditors: yuyuhailian 1411102347@qq.com
 * @LastEditTime: 2025-09-29 16:31:33
 * @FilePath: \manager-web-react\src\components\auth\UsernameInput.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 用户名输入组件
 * 用于用户名方式登录的输入字段
 */
import { User } from "lucide-react";
import React from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Input } from "../ui/input";

export interface UsernameInputProps {
  register: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({
  register,
  error,
  disabled = false,
  placeholder = "请输入用户名",
  className = "",
}) => {
  console.log("[UsernameInput] 渲染用户名输入组件", { disabled, hasError: !!error });

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">用户名</label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          {...register} 
          type="text" 
          placeholder={placeholder} 
          className="pl-10 h-11 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
          aria-invalid={!!error}
          aria-describedby={error ? `${register.name}-error` : undefined}
          disabled={disabled} 
        />
      </div>
      {error && (
        <p id={`${register.name}-error`} role="alert" className="text-sm text-destructive font-medium">{error.message}</p>
      )}
    </div>
  );
};
