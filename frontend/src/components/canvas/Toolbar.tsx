/**
 * 캔버스 툴바 컴포넌트
 * - zundo temporal을 사용한 Undo/Redo
 * - 레이어 순서 관리
 */

import { useCallback } from 'react';
import { useCanvasStore, getTemporalState } from '../../store/canvasStore';
import type { RectShape, CircleShape, TextShape } from '../../types/canvas';

export default function Toolbar() {
  const {
    addNode,
    deleteNode,
    selectedIds,
    saveProject,
    isSaving,
    lastSaved,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useCanvasStore();
  
  // zundo temporal에서 Undo/Redo 상태 가져오기
  const temporal = getTemporalState();

  // 사각형 추가
  const handleAddRect = useCallback(() => {
    const newRect: RectShape = {
      id: `rect-${Date.now()}`,
      type: 'rect',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 150,
      height: 100,
      fill: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      cornerRadius: 8,
    };
    addNode(newRect);
  }, [addNode]);

  // 원 추가
  const handleAddCircle = useCallback(() => {
    const newCircle: CircleShape = {
      id: `circle-${Date.now()}`,
      type: 'circle',
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      radius: 50,
      fill: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    };
    addNode(newCircle);
  }, [addNode]);

  // 텍스트 추가
  const handleAddText = useCallback(() => {
    const newText: TextShape = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      text: '텍스트를 입력하세요',
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#333333',
    };
    addNode(newText);
  }, [addNode]);

  // 선택 삭제
  const handleDelete = useCallback(() => {
    selectedIds.forEach((id) => deleteNode(id));
  }, [selectedIds, deleteNode]);

  // 저장
  const handleSave = useCallback(async () => {
    try {
      await saveProject();
    } catch (error) {
      console.error('저장 실패:', error);
    }
  }, [saveProject]);

  // zundo에서 undo/redo 가능 여부 확인
  const canUndo = temporal.pastStates.length > 0;
  const canRedo = temporal.futureStates.length > 0;
  
  // 레이어 순서 변경
  const handleLayerOrder = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    if (selectedIds.length === 0) return;
    const id = selectedIds[0];
    
    switch (direction) {
      case 'front': bringToFront(id); break;
      case 'back': sendToBack(id); break;
      case 'forward': bringForward(id); break;
      case 'backward': sendBackward(id); break;
    }
  };

  return (
    <div className="toolbar flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
      {/* 도형 추가 */}
      <div className="flex gap-1">
        <button
          onClick={handleAddRect}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          title="사각형 추가"
        >
          ▢ 사각형
        </button>
        <button
          onClick={handleAddCircle}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          title="원 추가"
        >
          ○ 원
        </button>
        <button
          onClick={handleAddText}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          title="텍스트 추가"
        >
          T 텍스트
        </button>
      </div>

      <div className="w-px h-8 bg-gray-600" />

      {/* Undo/Redo (zundo temporal) */}
      <div className="flex gap-1">
        <button
          onClick={() => temporal.undo()}
          disabled={!canUndo}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            canUndo
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="실행 취소 (Ctrl+Z)"
        >
          ↩ 취소
        </button>
        <button
          onClick={() => temporal.redo()}
          disabled={!canRedo}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            canRedo
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="다시 실행 (Ctrl+Y)"
        >
          ↪ 다시
        </button>
      </div>

      <div className="w-px h-8 bg-gray-600" />

      {/* 레이어 순서 */}
      <div className="flex gap-1">
        <button
          onClick={() => handleLayerOrder('front')}
          disabled={selectedIds.length === 0}
          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
            selectedIds.length > 0
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="맨 앞으로"
        >
          ⬆⬆
        </button>
        <button
          onClick={() => handleLayerOrder('forward')}
          disabled={selectedIds.length === 0}
          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
            selectedIds.length > 0
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="앞으로"
        >
          ⬆
        </button>
        <button
          onClick={() => handleLayerOrder('backward')}
          disabled={selectedIds.length === 0}
          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
            selectedIds.length > 0
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="뒤로"
        >
          ⬇
        </button>
        <button
          onClick={() => handleLayerOrder('back')}
          disabled={selectedIds.length === 0}
          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
            selectedIds.length > 0
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="맨 뒤로"
        >
          ⬇⬇
        </button>
      </div>

      <div className="w-px h-8 bg-gray-600" />

      {/* 삭제 */}
      <button
        onClick={handleDelete}
        disabled={selectedIds.length === 0}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          selectedIds.length > 0
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
        title="삭제 (Delete)"
      >
        🗑 삭제
      </button>

      {/* 스페이서 */}
      <div className="flex-1" />

      {/* 저장 상태 */}
      {lastSaved && (
        <span className="text-sm text-gray-400">
          마지막 저장: {lastSaved.toLocaleTimeString()}
        </span>
      )}

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isSaving
            ? 'bg-gray-600 text-gray-400 cursor-wait'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {isSaving ? '저장 중...' : '💾 저장'}
      </button>
    </div>
  );
}
