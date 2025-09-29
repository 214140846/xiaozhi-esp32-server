/**
 * 手机号输入组件
 * 包含区号选择和手机号输入功能
 */
import React from "react";

import { type FieldError, type UseFormRegisterReturn, type UseFormSetValue } from "react-hook-form";
import type { MobileArea } from "../../types/auth";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface MobileInputProps {
  mobileRegister: UseFormRegisterReturn;
  mobileError?: FieldError;
  areaCode: string;
  setValue: UseFormSetValue<any>;
  mobileAreaList?: MobileArea[];
  disabled?: boolean;
  className?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  mobileRegister,
  mobileError,
  areaCode,
  setValue,
  mobileAreaList = [],
  disabled = false,
  className = "",
}) => {
  console.log("[MobileInput] 渲染手机号输入组件", {
    areaCode,
    disabled,
    hasError: !!mobileError,
    areaListCount: mobileAreaList.length,
  });

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">手机号码</label>
      <div className="flex gap-2">
        <Select
          value={areaCode}
          onValueChange={(value) => {
            console.log("[MobileInput] 区号选择变更:", value);
            setValue("areaCode", value);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-28 h-11 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
            <SelectValue placeholder="区号" />
          </SelectTrigger>
          <SelectContent>
            {mobileAreaList.map((area) => (
              <SelectItem key={area.key} value={area.key}>
                {area.name} ({area.key})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input 
          {...mobileRegister} 
          type="tel" 
          placeholder="请输入手机号码" 
          className="flex-1 h-11 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200" 
          aria-invalid={!!mobileError}
          aria-describedby={mobileError ? `${mobileRegister.name}-error` : undefined}
          disabled={disabled} 
        />
      </div>
      {mobileError && (
        <p id={`${mobileRegister.name}-error`} role="alert" className="text-sm text-destructive font-medium">{mobileError.message}</p>
      )}
    </div>
  );
};
