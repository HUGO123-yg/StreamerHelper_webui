import axios from 'axios';
import { Config, Streamer, RecordedFile } from '../types';

// 配置axios默认设置
axios.defaults.baseURL = 'http://localhost:8080/api';
axios.defaults.timeout = 10000;

// 配置管理API
export const configApi = {
  // 获取完整配置
  getConfig: async (): Promise<Config> => {
    const response = await axios.get('/config');
    return response.data;
  },
  
  // 更新完整配置
  updateConfig: async (config: Config): Promise<void> => {
    await axios.put('/config', config);
  },
  
  // 获取主播列表配置
  getStreamersConfig: async (): Promise<Streamer[]> => {
    const response = await axios.get('/config/streamers');
    return response.data;
  }
};

// 主播管理API
export const streamerApi = {
  // 获取所有主播
  getStreamers: async (): Promise<Streamer[]> => {
    const response = await axios.get('/streamers');
    return response.data;
  },
  
  // 添加主播
  addStreamer: async (streamer: Streamer): Promise<void> => {
    await axios.post('/streamers', streamer);
  },
  
  // 更新主播
  updateStreamer: async (name: string, streamer: Streamer): Promise<void> => {
    await axios.put(`/streamers/${name}`, streamer);
  },
  
  // 删除主播
  deleteStreamer: async (name: string): Promise<void> => {
    await axios.delete(`/streamers/${name}`);
  }
};

// 录制文件管理API
export const fileApi = {
  // 获取录制文件
  getFiles: async (): Promise<RecordedFile[]> => {
    const response = await axios.get('/files');
    return response.data;
  },
  
  // 删除录制文件
  deleteFiles: async (files: string[]): Promise<void> => {
    await axios.delete('/files', { data: { files } });
  }
};

// 系统状态API
export const systemApi = {
  // 获取系统状态
  getSystemStatus: async () => {
    const response = await axios.get('/status/system');
    return response.data;
  }
};