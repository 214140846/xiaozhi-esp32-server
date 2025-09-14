import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { KeyRound, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useUserChangePasswordChangePasswordMutation } from '@/hooks/user/generatedHooks'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface UserMenuProps {
  compact?: boolean
}

export function UserMenu({ compact = false }: UserMenuProps) {
  const { state, logout } = useAuth()
  const navigate = useNavigate()

  // dropdown state
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onDocClick)
    }
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  // dialogs
  const [pwdOpen, setPwdOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const changePwdMutation = useUserChangePasswordChangePasswordMutation()

  const trigger = (
    <Button variant="outline" size={compact ? 'icon' : 'sm'} onClick={() => setMenuOpen((v) => !v)} aria-label="用户菜单">
      <UserIcon className="h-4 w-4" />
      {!compact && (
        <>
          <span className="ml-2 max-w-[8rem] truncate">{state.user?.username || '用户'}</span>
          <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
        </>
      )}
    </Button>
  )

  return (
    <div className="relative" ref={menuRef}>
      {trigger}
      {menuOpen && (
        <div className="absolute right-0 mt-2 z-50 w-40 rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="px-3 py-2 text-xs text-muted-foreground">{state.user?.username || '未登录'}</div>
          <div className="py-1">
            <button
              className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted"
              onClick={() => {
                setMenuOpen(false)
                setPwdOpen(true)
              }}
            >
              <KeyRound className="h-4 w-4" /> 修改密码
            </button>
            <button
              className="w-full px-3 py-2 text-sm flex items-center gap-2 text-destructive hover:bg-muted"
              onClick={() => {
                setMenuOpen(false)
                setLogoutOpen(true)
              }}
            >
              <LogOut className="h-4 w-4" /> 退出登录
            </button>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">当前密码</label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="请输入当前密码" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">新密码</label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">确认新密码</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                if (!currentPassword || !newPassword) {
                  toast('请输入完整信息')
                  return
                }
                if (newPassword.length < 6) {
                  toast('新密码至少6位')
                  return
                }
                if (newPassword !== confirmPassword) {
                  toast('两次输入的新密码不一致')
                  return
                }
                try {
                  const res = await changePwdMutation.mutateAsync({ data: { password: currentPassword, newPassword } })
                  if ((res as any)?.code === 0) {
                    toast('密码修改成功')
                    setPwdOpen(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  } else {
                    toast((res as any)?.msg || '修改失败')
                  }
                } catch (e: any) {
                  toast(e?.message || '修改失败')
                }
              }}
              disabled={changePwdMutation.isPending}
            >
              {changePwdMutation.isPending ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 退出登录确认 */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>退出后需要重新登录才能继续使用。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await logout()
                } finally {
                  navigate('/login')
                }
              }}
            >
              退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default UserMenu

