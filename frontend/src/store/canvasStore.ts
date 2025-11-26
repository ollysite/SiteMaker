/**
 * 캔버스 상태 관리 (Zustand + Zundo)
 * - zundo temporal: 자동 Undo/Redo 히스토리 관리
 * - nodes만 히스토리에 포함, UI 상태는 제외
 */

import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Shape, CanvasData, Project } from '../types/canvas';
import { api } from '../services/api';

interface CanvasState {
  // 프로젝트
  projectId: number | null;
  projectTitle: string;
  
  // 캔버스 데이터 (zundo가 자동 추적)
  nodes: Shape[];
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  
  // UI 상태 (히스토리에서 제외)
  selectedIds: string[];
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // 액션
  setNodes: (nodes: Shape[]) => void;
  addNode: (node: Shape) => void;
  updateNode: (id: string, updates: Partial<Shape>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  // 프로젝트
  loadProject: (projectId: number) => Promise<void>;
  saveProject: () => Promise<void>;
  createProject: (title: string) => Promise<Project>;
  
  // 레이어 순서
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

// zundo temporal 미들웨어 적용
export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set, get) => ({
      // 초기 상태
      projectId: null,
      projectTitle: '새 프로젝트',
      nodes: [],
      selectedIds: [],
      canvasWidth: 1920,
      canvasHeight: 1080,
      background: '#ffffff',
      isLoading: false,
      isSaving: false,
      lastSaved: null,

      // 노드 관리
      setNodes: (nodes) => {
        set({ nodes });
      },

      addNode: (node) => {
        const { nodes } = get();
        set({ nodes: [...nodes, node] });
      },

      updateNode: (id, updates) => {
        const { nodes } = get();
        set({
          nodes: nodes.map((node) =>
            node.id === id ? { ...node, ...updates } as Shape : node
          ),
        });
      },

      deleteNode: (id) => {
        const { nodes, selectedIds } = get();
        set({
          nodes: nodes.filter((node) => node.id !== id),
          selectedIds: selectedIds.filter((selectedId) => selectedId !== id),
        });
      },

      selectNode: (id, multi = false) => {
        const { selectedIds } = get();
        if (multi) {
          if (selectedIds.includes(id)) {
            set({ selectedIds: selectedIds.filter((sid) => sid !== id) });
          } else {
            set({ selectedIds: [...selectedIds, id] });
          }
        } else {
          set({ selectedIds: [id] });
        }
      },

      clearSelection: () => {
        set({ selectedIds: [] });
      },

      // 프로젝트 관리
      loadProject: async (projectId) => {
        set({ isLoading: true });
        try {
          const project = await api.getProject(projectId);
          const canvasData = project.canvas_data || { layers: [] };
          
          set({
            projectId: project.id,
            projectTitle: project.title,
            nodes: canvasData.layers || [],
            canvasWidth: project.width || 1920,
            canvasHeight: project.height || 1080,
            background: canvasData.background || '#ffffff',
            isLoading: false,
          });
          
          // 히스토리 초기화
          useCanvasStore.temporal.getState().clear();
        } catch (error) {
          console.error('프로젝트 로드 실패:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      saveProject: async () => {
        const { projectId, nodes, canvasWidth, canvasHeight, background } = get();
        if (!projectId) return;

        set({ isSaving: true });
        try {
          const canvasData: CanvasData = {
            layers: nodes,
            background,
            width: canvasWidth,
            height: canvasHeight,
          };

          await api.saveCanvas(projectId, canvasData);
          set({ isSaving: false, lastSaved: new Date() });
        } catch (error) {
          console.error('프로젝트 저장 실패:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      createProject: async (title) => {
        const project = await api.createProject(title);
        set({
          projectId: project.id,
          projectTitle: project.title,
          nodes: [],
        });
        // 히스토리 초기화
        useCanvasStore.temporal.getState().clear();
        return project;
      },

      // 레이어 순서 관리
      bringToFront: (id) => {
        const { nodes } = get();
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1 || index === nodes.length - 1) return;
        
        const newNodes = [...nodes];
        const [item] = newNodes.splice(index, 1);
        newNodes.push(item);
        set({ nodes: newNodes });
      },

      sendToBack: (id) => {
        const { nodes } = get();
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1 || index === 0) return;
        
        const newNodes = [...nodes];
        const [item] = newNodes.splice(index, 1);
        newNodes.unshift(item);
        set({ nodes: newNodes });
      },

      bringForward: (id) => {
        const { nodes } = get();
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1 || index === nodes.length - 1) return;
        
        const newNodes = [...nodes];
        [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
        set({ nodes: newNodes });
      },

      sendBackward: (id) => {
        const { nodes } = get();
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1 || index === 0) return;
        
        const newNodes = [...nodes];
        [newNodes[index], newNodes[index - 1]] = [newNodes[index - 1], newNodes[index]];
        set({ nodes: newNodes });
      },
    }),
    {
      // zundo 설정: UI 상태는 히스토리에서 제외
      partialize: (state) => ({
        nodes: state.nodes,
      }),
      limit: 50, // 최대 50개 히스토리
    }
  )
);

// Undo/Redo 액세스
export const getTemporalState = () => useCanvasStore.temporal.getState();
