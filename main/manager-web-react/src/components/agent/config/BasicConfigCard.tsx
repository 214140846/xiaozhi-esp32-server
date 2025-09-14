import { useMemo } from 'react'
import { Controller, type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props = {
  control: Control<any>
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
}

export function BasicConfigCard({ control, setValue, watch }: Props) {
  const languageWatch = watch('language')
  const langCodeWatch = watch('langCode')

  const baseLangPairs = [
    { label: '中文（zh-CN）', language: 'zh', code: 'zh-CN' },
    { label: 'English (en-US)', language: 'en', code: 'en-US' },
    { label: '日本語（ja-JP）', language: 'ja', code: 'ja-JP' },
    { label: '한국어 (ko-KR)', language: 'ko', code: 'ko-KR' },
    { label: 'Deutsch (de-DE)', language: 'de', code: 'de-DE' },
    { label: 'Français (fr-FR)', language: 'fr', code: 'fr-FR' },
    { label: 'Español (es-ES)', language: 'es', code: 'es-ES' },
    { label: 'Italiano (it-IT)', language: 'it', code: 'it-IT' },
    { label: 'Русский (ru-RU)', language: 'ru', code: 'ru-RU' },
  ]

  const combinedOptions = useMemo(() => {
    const exists = baseLangPairs.some((p) => p.language === (languageWatch || '') && p.code === (langCodeWatch || ''))
    if (languageWatch && langCodeWatch && !exists) {
      return [
        ...baseLangPairs,
        { label: `(当前) ${languageWatch} - ${langCodeWatch}`, language: languageWatch, code: langCodeWatch },
      ]
    }
    return baseLangPairs
  }, [languageWatch, langCodeWatch])

  const combinedValue = useMemo(() => {
    return languageWatch && langCodeWatch ? `${languageWatch}|${langCodeWatch}` : ''
  }, [languageWatch, langCodeWatch])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>基础配置</CardTitle>
        <CardDescription>名称、语言与基础参数</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <div className="space-y-2">
            <Label htmlFor="agentName">名称</Label>
            <Controller
              control={control}
              name="agentName"
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <Input id="agentName" placeholder="输入名称" {...field} />
                  {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                </div>
              )}
            />
          </div>

          {/* 编码输入框按需求移除 */}

          <div className="space-y-2">
            <Label htmlFor="languageCombined">语言</Label>
            <Select
              value={combinedValue}
              onValueChange={(val) => {
                const [lang, code] = val.split('|')
                setValue('language', lang, { shouldDirty: true })
                setValue('langCode', code, { shouldDirty: true })
              }}
            >
              <SelectTrigger id="languageCombined">
                <SelectValue placeholder="选择语言与代码" />
              </SelectTrigger>
              <SelectContent>
                {combinedOptions.map((opt) => (
                  <SelectItem key={`${opt.language}|${opt.code}`} value={`${opt.language}|${opt.code}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 按需求隐藏：聊天历史条数 */}

          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Label htmlFor="sort">排序权重</Label>
            <Controller
              control={control}
              name="sort"
              render={({ field }) => <Input id="sort" type="number" inputMode="numeric" placeholder="越小越靠前" {...field} onChange={(e) => field.onChange(e.target.value)} />}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BasicConfigCard
