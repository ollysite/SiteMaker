/**
 * ScraperPark Canvas Editor
 * Canva 스타일의 디자인 에디터
 */

import { useEffect, useState } from 'react';
import CanvasEditor from './components/canvas/CanvasEditor';
import Toolbar from './components/canvas/Toolbar';
import { useCanvasStore } from './store/canvasStore';
import { api } from './services/api';
import type { Project } from './types/canvas';
import './App.css';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectList, setShowProjectList] = useState(true);
  const { projectId, projectTitle, canvasWidth, canvasHeight, createProject, loadProject } = useCanvasStore();

  // 프로젝트 목록 로드
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('프로젝트 목록 로드 실패:', error);
    }
  };

  // 새 프로젝트 생성
  const handleCreateProject = async () => {
    try {
      const title = prompt('프로젝트 이름을 입력하세요:', '새 프로젝트');
      if (!title) return;

      const project = await createProject(title);
      setProjects([project, ...projects]);
      setShowProjectList(false);
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    }
  };

  // 프로젝트 선택
  const handleSelectProject = async (id: number) => {
    try {
      await loadProject(id);
      setShowProjectList(false);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    }
  };

  // 키보드 단축키 (zundo temporal 사용)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { deleteNode, selectedIds, saveProject, clearSelection } = useCanvasStore.getState();
      const temporal = useCanvasStore.temporal.getState();

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          temporal.undo(); // zundo undo
        } else if (e.key === 'y') {
          e.preventDefault();
          temporal.redo(); // zundo redo
        } else if (e.key === 's') {
          e.preventDefault();
          saveProject();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          selectedIds.forEach((id) => deleteNode(id));
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 프로젝트 목록 화면
  if (showProjectList) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">ScraperPark Canvas</h1>
              <p className="text-gray-400 mt-1">Canva 스타일 디자인 에디터</p>
            </div>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              + 새 프로젝트
            </button>
          </header>

          {/* 프로젝트 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
              >
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  {project.thumbnail_data ? (
                    <img
                      src={project.thumbnail_data}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🎨</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-6xl mb-4">📁</p>
                <p>프로젝트가 없습니다.</p>
                <p className="text-sm mt-1">새 프로젝트를 만들어보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 에디터 화면
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="flex items-center gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setShowProjectList(true)}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          ← 목록
        </button>
        <h1 className="font-semibold">{projectTitle}</h1>
        <span className="text-sm text-gray-400">
          {canvasWidth} × {canvasHeight}
        </span>
      </header>

      {/* 툴바 */}
      <Toolbar />

      {/* 캔버스 영역 */}
      <div className="flex-1 overflow-auto p-4 bg-gray-950">
        <CanvasEditor projectId={projectId || undefined} />
      </div>
    </div>
  );
}

export default App;
