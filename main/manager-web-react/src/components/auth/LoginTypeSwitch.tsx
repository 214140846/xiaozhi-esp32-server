/**
 * 登录方式切换组件
 * 提供用户名和手机号两种登录方式的切换功能
 */
import React from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Smartphone, User } from 'lucide-react';
import { LoginType, type LoginTypeValue } from '../../types/auth';

export interface LoginTypeSwitchProps {
  currentLoginType: LoginTypeValue;
  onLoginTypeChange: (type: LoginTypeValue) => void;
  disabled?: boolean;
  className?: string;
}

export const LoginTypeSwitch: React.FC<LoginTypeSwitchProps> = ({
  currentLoginType,
  onLoginTypeChange,
  disabled = false,
  className = ''
}) => {
  console.log('[LoginTypeSwitch] 渲染登录方式切换组件', { 
    currentLoginType, 
    disabled 
  });

  const handleTypeSwitch = (type: LoginTypeValue) => {
    console.log('[LoginTypeSwitch] 切换登录方式:', type);
    onLoginTypeChange(type);
  };

  return (
    <div className={`flex justify-center gap-4 pt-4 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={currentLoginType === LoginType.MOBILE ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeSwitch(LoginType.MOBILE)}
              disabled={disabled}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>手机号码登录</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={currentLoginType === LoginType.USERNAME ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeSwitch(LoginType.USERNAME)}
              disabled={disabled}
            >
              <User className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>用户名登录</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};