/**
 * FastAPI 백엔드 API 서비스
 */

import axios from 'axios';
import type { Project, CanvasData } from '../types/canvas';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 프로젝트 CRUD
  async getProjects(skip = 0, limit = 20): Promise<Project[]> {
    const { data } = await client.get(`/projects/?skip=${skip}&limit=${limit}`);
    return data;
  },

  async getProject(projectId: number): Promise<Project> {
    const { data } = await client.get(`/projects/${projectId}`);
    return data;
  },

  async createProject(title: string, width = 1920, height = 1080): Promise<Project> {
    const { data } = await client.post('/projects/', {
      title,
      width,
      height,
    });
    return data;
  },

  async updateProject(projectId: number, updates: Partial<Project>): Promise<Project> {
    const { data } = await client.patch(`/projects/${projectId}`, updates);
    return data;
  },

  async deleteProject(projectId: number): Promise<void> {
    await client.delete(`/projects/${projectId}`);
  },

  // 캔버스 저장/불러오기
  async saveCanvas(projectId: number, canvasData: CanvasData, thumbnail?: string): Promise<Project> {
    const { data } = await client.post(`/projects/${projectId}/save`, {
      canvas_data: canvasData,
      thumbnail,
    });
    return data;
  },

  // Undo/Redo
  async undo(projectId: number): Promise<{ success: boolean; canvas_data?: CanvasData }> {
    const { data } = await client.post(`/projects/${projectId}/undo`);
    return data;
  },

  async redo(projectId: number): Promise<{ success: boolean; canvas_data?: CanvasData }> {
    const { data } = await client.post(`/projects/${projectId}/redo`);
    return data;
  },

  // AI 기능
  async generateImage(prompt: string, style?: string, width = 512, height = 512) {
    const { data } = await client.post('/ai/image', {
      prompt,
      style,
      width,
      height,
    });
    return data;
  },

  async aiChat(message: string, context?: Record<string, unknown>) {
    const { data } = await client.post('/ai/chat', { message, context });
    return data;
  },

  // 에셋
  async uploadAsset(projectId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await client.post(`/assets/upload?project_id=${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadBase64(projectId: number, name: string, base64Data: string) {
    const { data } = await client.post('/assets/upload-base64', {
      project_id: projectId,
      name,
      base64_data: base64Data,
    });
    return data;
  },
};
