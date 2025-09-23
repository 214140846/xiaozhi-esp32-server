import React from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  useAdminParamsGetQuery,
  useAdminParamsSaveMutation,
  useAdminParamsUpdate1Mutation,
} from "@/hooks/admin";

const VALUE_TYPE_OPTIONS = ["string", "number", "boolean", "array", "json"] as const;
type ValueType = (typeof VALUE_TYPE_OPTIONS)[number];
const VALUE_TYPE_LABELS: Record<ValueType, string> = {
  string: "字符串 (string)",
  number: "数字 (number)",
  boolean: "布尔值 (boolean)",
  array: "数组 (array)",
  json: "JSON 对象 (json)",
};
const normalizeValueType = (value: unknown): ValueType => {
  if (typeof value !== "string") return "string";
  const lower = value.toLowerCase();
  return (VALUE_TYPE_OPTIONS as readonly string[]).includes(lower) ? (lower as ValueType) : "string";
};

const formSchema = z.object({
  id: z.number().optional(),
  paramCode: z.string().min(1, "请输入参数编码"),
  paramValue: z.string().min(1, "请输入参数值"),
  valueType: z.enum(VALUE_TYPE_OPTIONS, {
    required_error: "请选择值类型",
    invalid_type_error: "请选择值类型",
  }),
  remark: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export interface ParamEditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editId?: number | null;
  onSuccess?: () => void;
}

export function ParamEditDialog({ open, onOpenChange, editId, onSuccess }: ParamEditDialogProps) {
  const isEdit = Boolean(editId);

  const { data: detailRes, isFetching: loadingDetail } = useAdminParamsGetQuery(
    { id: editId || 0 },
    undefined,
    { enabled: open && Boolean(editId) }
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      paramCode: "",
      paramValue: "",
      valueType: "string",
      remark: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && detailRes?.data) {
      const d: any = detailRes.data as any;
      reset({
        id: d?.id ? Number(d.id) : undefined,
        paramCode: d?.paramCode ?? "",
        paramValue: d?.paramValue ?? "",
        valueType: normalizeValueType(d?.valueType),
        remark: d?.remark ?? "",
      });
    } else if (!isEdit) {
      reset({ id: undefined, paramCode: "", paramValue: "", valueType: "string", remark: "" });
    }
  }, [open, isEdit, detailRes?.data, reset]);

  const { mutateAsync: saveParam, isPending: saving } = useAdminParamsSaveMutation();
  const { mutateAsync: updateParam, isPending: updating } = useAdminParamsUpdate1Mutation();

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: any = {
        ...(isEdit ? { id: values.id } : {}),
        paramCode: values.paramCode,
        paramValue: values.paramValue,
        valueType: values.valueType,
        remark: values.remark || "",
      } as any;

      const resp = await (isEdit ? updateParam({ data: payload }) : saveParam({ data: payload }));
      if ((resp as any)?.code === 0) {
        toast.success(isEdit ? "修改成功" : "新建成功");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error((resp as any)?.msg || "操作失败");
      }
    } catch (e: any) {
      toast.error(e?.message || "操作失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑参数" : "新建参数"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paramCode">参数编码</Label>
            <Input id="paramCode" placeholder="如 openai.api_key" autoFocus disabled={loadingDetail} {...register("paramCode")} />
            {errors.paramCode && <p className="text-sm text-destructive">{errors.paramCode.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="valueType">值类型</Label>
            <Controller
              control={control}
              name="valueType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="valueType">
                    <SelectValue placeholder="请选择值类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {VALUE_TYPE_LABELS[opt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.valueType && <p className="text-sm text-destructive">{errors.valueType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paramValue">参数值</Label>
            <Textarea id="paramValue" placeholder="请输入参数值" rows={4} {...register("paramValue")} />
            {errors.paramValue && <p className="text-sm text-destructive">{errors.paramValue.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Input id="remark" placeholder="可选" {...register("remark")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || saving || updating}>
              {isEdit ? "保存修改" : "确认新建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ParamEditDialog;

