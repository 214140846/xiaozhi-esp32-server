import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { saveOta, updateOta, uploadFirmware } from '@/api/otaApi';
import type { OtaFormData, ApiResponse } from '@/types/ota';
import type { AxiosProgressEvent } from 'axios';

export const useOtaDialog = () => {
  const queryClient = useQueryClient();
  
  // 对话框状态
  const [isVisible, setIsVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('新增固件');
  
  // 表单数据
  const [formData, setFormData] = useState<OtaFormData>({
    id: null,
    firmwareName: '',
    type: '',
    version: '',
    size: 0,
    remark: '',
    firmwarePath: ''
  });

  // 上传状态
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'success' | 'error' | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  // 保存/更新固件信息
  const saveMutation = useMutation({
    mutationFn: async (data: OtaFormData) => {
      console.log('useOtaDialog: 保存固件数据:', data);
      if (data.id) {
        // 编辑模式
        const { id, ...updateData } = data;
        return await updateOta(id, updateData);
      } else {
        // 新增模式
        const { id, ...saveData } = data;
        return await saveOta(saveData);
      }
    },
    onSuccess: (response: ApiResponse) => {
      console.log('useOtaDialog: 保存成功响应:', response);
      if (response.code === 0) {
        const action = formData.id ? '修改' : '新增';
        toast({
          title: `${action}成功`,
          description: `固件${action}操作完成`,
        });
        
        // 关闭对话框并刷新列表
        setIsVisible(false);
        queryClient.invalidateQueries({ queryKey: ['otaList'] });
        resetForm();
      } else {
        throw new Error(response.message || response.msg || '操作失败');
      }
    },
    onError: (error: Error) => {
      console.error('useOtaDialog: 保存失败:', error);
      const action = formData.id ? '修改' : '新增';
      toast({
        title: `${action}失败`,
        description: error.message || `${action}固件时发生错误`,
        variant: 'destructive',
      });
    },
  });

  // 上传固件文件
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      console.log('useOtaDialog: 开始上传文件:', file.name, '大小:', file.size);
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStatus('uploading');
      
      return uploadFirmware(file, (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.max(progress, 50)); // 确保最小显示50%
          console.log('useOtaDialog: 上传进度:', progress + '%');
        }
      });
    },
    onSuccess: (response: ApiResponse<string>) => {
      console.log('useOtaDialog: 上传成功响应:', response);
      if (response.code === 0) {
        setUploadProgress(100);
        setUploadStatus('success');
        setFormData(prev => ({
          ...prev,
          firmwarePath: response.data!,
        }));
        
        toast({
          title: '上传成功',
          description: '固件文件上传完成',
        });
        
        // 延迟隐藏进度条
        setTimeout(() => {
          setIsUploading(false);
        }, 2000);
      } else {
        throw new Error(response.message || response.msg || '文件上传失败');
      }
    },
    onError: (error: Error) => {
      console.error('useOtaDialog: 上传失败:', error);
      setUploadStatus('error');
      setIsUploading(false);
      toast({
        title: '上传失败',
        description: error.message || '文件上传时发生错误',
        variant: 'destructive',
      });
    },
  });

  // 重置表单
  const resetForm = useCallback(() => {
    console.log('useOtaDialog: 重置表单');
    setFormData({
      id: null,
      firmwareName: '',
      type: '',
      version: '',
      size: 0,
      remark: '',
      firmwarePath: ''
    });
    setUploadProgress(0);
    setUploadStatus('');
    setIsUploading(false);
  }, []);

  // 显示新增对话框
  const showAddDialog = useCallback(() => {
    console.log('useOtaDialog: 显示新增对话框');
    setDialogTitle('新增固件');
    resetForm();
    setIsVisible(true);
  }, [resetForm]);

  // 显示编辑对话框
  const showEditDialog = useCallback((firmware: OtaFormData) => {
    console.log('useOtaDialog: 显示编辑对话框, 数据:', firmware);
    setDialogTitle('编辑固件');
    setFormData({ ...firmware });
    setIsVisible(true);
  }, []);

  // 隐藏对话框
  const hideDialog = useCallback(() => {
    console.log('useOtaDialog: 隐藏对话框');
    setIsVisible(false);
    resetForm();
  }, [resetForm]);

  // 提交表单
  const handleSubmit = useCallback(() => {
    console.log('useOtaDialog: 提交表单, 数据:', formData);
    
    // 验证必填字段
    if (!formData.firmwareName.trim()) {
      toast({
        title: '验证失败',
        description: '请输入固件名称',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.type) {
      toast({
        title: '验证失败',
        description: '请选择固件类型',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.version.trim()) {
      toast({
        title: '验证失败',
        description: '请输入版本号',
        variant: 'destructive',
      });
      return;
    }
    
    // 版本号格式验证
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(formData.version)) {
      toast({
        title: '验证失败',
        description: '版本号格式不正确，请输入x.x.x格式',
        variant: 'destructive',
      });
      return;
    }
    
    // 新增模式需要验证文件上传
    if (!formData.id && !formData.firmwarePath) {
      toast({
        title: '验证失败',
        description: '请上传固件文件',
        variant: 'destructive',
      });
      return;
    }
    
    saveMutation.mutate(formData);
  }, [formData, saveMutation]);

  // 处理文件上传
  const handleFileUpload = useCallback((file: File) => {
    console.log('useOtaDialog: 处理文件上传:', file.name);
    
    // 文件类型验证
    const validExtensions = ['.bin', '.apk'];
    const isValidType = validExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!isValidType) {
      toast({
        title: '文件类型错误',
        description: '只能上传.bin/.apk格式的固件文件',
        variant: 'destructive',
      });
      return false;
    }
    
    // 文件大小验证（100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: '文件过大',
        description: '固件文件大小不能超过100MB',
        variant: 'destructive',
      });
      return false;
    }
    
    // 更新文件大小到表单
    setFormData(prev => ({
      ...prev,
      size: file.size
    }));
    
    // 执行上传
    uploadMutation.mutate(file);
    return true;
  }, [uploadMutation]);

  // 移除上传的文件
  const handleFileRemove = useCallback(() => {
    console.log('useOtaDialog: 移除上传文件');
    setFormData(prev => ({
      ...prev,
      firmwarePath: '',
      size: 0
    }));
    setUploadProgress(0);
    setUploadStatus('');
    setIsUploading(false);
  }, []);

  // 更新表单字段
  const updateField = useCallback((field: keyof OtaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return {
    // 状态
    isVisible,
    dialogTitle,
    formData,
    uploadProgress,
    uploadStatus,
    isUploading,
    
    // 加载状态
    isSaving: saveMutation.isPending,
    isUploadingFile: uploadMutation.isPending,
    
    // 方法
    showAddDialog,
    showEditDialog,
    hideDialog,
    handleSubmit,
    handleFileUpload,
    handleFileRemove,
    updateField,
    resetForm,
  };
};
