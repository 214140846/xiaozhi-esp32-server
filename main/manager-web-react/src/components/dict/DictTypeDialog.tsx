import React from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import type { SysDictTypeVO, SysDictTypeDTO } from '@/types/openapi/admin'
import { 
  useAdminDictTypeSaveSave1Mutation,
  useAdminDictTypeUpdateUpdate2Mutation,
} from '@/hooks/admin'

const DICT_TYPE_MAX_LEN = 64
const DICT_NAME_MAX_LEN = 64
const DICT_TYPE_PATTERN = /^[A-Za-z0-9_]+$/

export interface DictTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingType?: SysDictTypeVO | undefined
}

const schema = z.object({
  dictType: z
    .string()
    .trim()
    .min(1, '字典编码为必填')
    .max(DICT_TYPE_MAX_LEN, `字典编码长度不能超过${DICT_TYPE_MAX_LEN}字符`)
    .regex(DICT_TYPE_PATTERN, '仅支持字母/数字/下划线，不允许中文'),
  dictName: z
    .string()
    .trim()
    .min(1, '字典名称为必填')
    .max(DICT_NAME_MAX_LEN, `字典名称长度不能超过${DICT_NAME_MAX_LEN}字符`),
  remark: z.string().max(200, '备注不能超过200字符').optional().or(z.literal('')),
  sort: z.coerce.number().int('排序需为整数').min(0, '排序不能小于0').default(0),
})

type FormValues = z.infer<typeof schema>

export function DictTypeDialog({ open, onOpenChange, editingType }: DictTypeDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isComposingRef = useRef(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setValue, watch, setFocus } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dictType: '', dictName: '', remark: '', sort: 0 },
    mode: 'onChange',
  })

  const dictTypeVal = watch('dictType')
  const dictNameVal = watch('dictName')

  useEffect(() => {
    if (!open) return
    if (editingType) {
      reset({
        dictType: editingType.dictType || '',
        dictName: editingType.dictName || '',
        remark: editingType.remark || '',
        sort: editingType.sort ?? 0,
      })
    } else {
      reset({ dictType: '', dictName: '', remark: '', sort: 0 })
    }
  }, [open, editingType, reset])

  const createMutation = useAdminDictTypeSaveSave1Mutation({
    onSuccess: () => {
      toast({ description: '保存成功' })
      queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
      onOpenChange(false)
    },
    onError: (e: unknown) => {
      const message = (e && typeof e === 'object' && (e as any).response?.data?.msg) || (e as any)?.message || '保存失败'
      toast({ description: message, variant: 'destructive' })
    },
  })
  const updateMutation = useAdminDictTypeUpdateUpdate2Mutation({
    onSuccess: () => {
      toast({ description: '修改成功' })
      queryClient.invalidateQueries({ queryKey: ['AdminDictTypePage.Page1'] })
      onOpenChange(false)
    },
    onError: (e: unknown) => {
      const message = (e && typeof e === 'object' && (e as any).response?.data?.msg) || (e as any)?.message || '修改失败'
      toast({ description: message, variant: 'destructive' })
    },
  })

  const onSubmit = async (values: FormValues) => {
    const payload: SysDictTypeDTO = {
      id: editingType?.id,
      dictType: values.dictType.trim(),
      dictName: values.dictName.trim(),
      remark: (values.remark || '').trim(),
      sort: Number(values.sort || 0),
    }
    if (payload.id) {
      await updateMutation.mutateAsync({ data: payload })
    } else {
      await createMutation.mutateAsync({ data: payload })
    }
  }

  const onInvalid = (formErrors: any) => {
    if (formErrors?.dictType) {
      toast({ description: '字典编码仅支持字母/数字/下划线，不能包含中文', variant: 'destructive' })
      setFocus('dictType')
    }
  }

  const handleCompositionStart = () => { isComposingRef.current = true }
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false
    const value = (e.target as HTMLInputElement).value || ''
    if (value.length > DICT_TYPE_MAX_LEN) {
      setValue('dictType', value.slice(0, DICT_TYPE_MAX_LEN), { shouldValidate: true, shouldDirty: true })
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending || isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingType ? '编辑字典类型' : '新增字典类型'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="dictType">字典编码</Label>
            <Input
              id="dictType"
              {...register('dictType')}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder="如: device_status"
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
            />
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-500">仅字母/数字/下划线，不能包含中文，最长{DICT_TYPE_MAX_LEN}字符</span>
              <span className="text-gray-500">{(dictTypeVal || '').length}/{DICT_TYPE_MAX_LEN}</span>
            </div>
            {errors.dictType && (
              <div className="text-xs text-red-500 mt-1">{errors.dictType.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dictName">字典名称</Label>
            <Input id="dictName" maxLength={DICT_NAME_MAX_LEN} {...register('dictName')} placeholder="如: 设备状态" disabled={pending} />
            <div className="flex items-center justify-end text-xs mt-1">
              <span className="text-gray-500">{(dictNameVal || '').length}/{DICT_NAME_MAX_LEN}</span>
            </div>
            {errors.dictName && (
              <div className="text-xs text-red-500 mt-1">{errors.dictName.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="typeRemark">备注</Label>
            <Input id="typeRemark" {...register('remark')} placeholder="可选" disabled={pending} />
            {errors.remark && (
              <div className="text-xs text-red-500 mt-1">{errors.remark.message}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="typeSort">排序</Label>
            <Input id="typeSort" type="number" {...register('sort', { valueAsNumber: true })} disabled={pending} />
            {errors.sort && (
              <div className="text-xs text-red-500 mt-1">{errors.sort.message}</div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>取消</Button>
            <Button type="submit" disabled={pending} onClick={() => console.log('DictType 创建/保存按钮点击', { mode: editingType ? 'edit' : 'create' })}>{editingType ? '保存' : '创建'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DictTypeDialog


