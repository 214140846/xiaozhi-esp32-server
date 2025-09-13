import axios from 'axios';

// 定义基础URL
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '';
};

// 分页查询OTA固件信息
export const getOtaList = async (params: {
  pageNum: number;
  pageSize: number;
  firmwareName?: string;
  orderField?: string;
  order?: string;
}) => {
  console.log('调用OTA列表API, 参数:', params);
  try {
    const response = await axios.get(`${getApiBaseUrl()}/otaMag`, { params });
    console.log('OTA列表API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取OTA固件列表失败:', error);
    throw error;
  }
};

// 获取单个OTA固件信息
export const getOtaInfo = async (id: string | number) => {
  console.log('调用获取OTA详情API, ID:', id);
  try {
    const response = await axios.get(`${getApiBaseUrl()}/otaMag/${id}`);
    console.log('OTA详情API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取OTA固件信息失败:', error);
    throw error;
  }
};

// 保存OTA固件信息
export const saveOta = async (entity: {
  firmwareName: string;
  type: string;
  version: string;
  size: number;
  remark?: string;
  firmwarePath: string;
}) => {
  console.log('调用保存OTA API, 数据:', entity);
  try {
    const response = await axios.post(`${getApiBaseUrl()}/otaMag`, entity);
    console.log('保存OTA API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('保存OTA固件信息失败:', error);
    throw error;
  }
};

// 更新OTA固件信息
export const updateOta = async (id: string | number, entity: {
  firmwareName: string;
  type: string;
  version: string;
  size: number;
  remark?: string;
  firmwarePath?: string;
}) => {
  console.log('调用更新OTA API, ID:', id, '数据:', entity);
  try {
    const response = await axios.put(`${getApiBaseUrl()}/otaMag/${id}`, entity);
    console.log('更新OTA API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新OTA固件信息失败:', error);
    throw error;
  }
};

// 删除OTA固件
export const deleteOta = async (ids: (string | number)[]) => {
  console.log('调用删除OTA API, IDs:', ids);
  try {
    const response = await axios.delete(`${getApiBaseUrl()}/otaMag/${ids.join(',')}`);
    console.log('删除OTA API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('删除OTA固件失败:', error);
    throw error;
  }
};

// 上传固件文件
export const uploadFirmware = async (
  file: File,
  onProgress?: (progressEvent: import('axios').AxiosProgressEvent) => void
) => {
  console.log('调用上传固件API, 文件:', file.name, '大小:', file.size);
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${getApiBaseUrl()}/otaMag/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    console.log('上传固件API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('上传固件文件失败:', error);
    throw error;
  }
};

// 获取固件下载链接
export const getDownloadUrl = async (id: string | number) => {
  console.log('调用获取下载链接API, ID:', id);
  try {
    const response = await axios.get(`${getApiBaseUrl()}/otaMag/getDownloadUrl/${id}`);
    console.log('获取下载链接API响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取下载链接失败:', error);
    throw error;
  }
};

// 下载固件文件
export const downloadFirmware = (downloadUuid: string) => {
  const baseUrl = getApiBaseUrl();
  const downloadUrl = `${window.location.origin}${baseUrl}/otaMag/download/${downloadUuid}`;
  console.log('执行固件下载, URL:', downloadUrl);
  window.open(downloadUrl, '_blank');
};