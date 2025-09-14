import type {
  SysDictTypeVO,
  SysDictDataVO,
  SysDictTypeDTO,
  SysDictDataDTO,
} from './openapi/admin'

// 适配页面与组件期望的类型命名
export type DictType = SysDictTypeVO
export type DictData = SysDictDataVO

export type DictTypeForm = SysDictTypeDTO
export type DictDataForm = SysDictDataDTO

