/**
 * 메인 캔버스 에디터 컴포넌트
 * Canva 스타일의 선택 + 드래그 + 리사이즈 지원
 */

import { useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Arrow } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../../store/canvasStore';
import Rectangle from './shapes/Rectangle';
import CircleShapeComponent from './shapes/CircleShape';
import TextShapeComponent from './shapes/TextShape';
import ImageShapeComponent from './shapes/ImageShape';
import type { Shape, RectShape, CircleShape, TextShape, ImageShape, LineShape } from '../../types/canvas';

interface CanvasEditorProps {
  projectId?: number;
}

export default function CanvasEditor({ projectId }: CanvasEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);

  const {
    nodes,
    selectedIds,
    canvasWidth,
    canvasHeight,
    background,
    isLoading,
    loadProject,
    updateNode,
    selectNode,
    clearSelection,
  } = useCanvasStore();

  // 프로젝트 로드
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  // 빈 공간 클릭 시 선택 해제
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  // Shape 렌더링 - 개별 컴포넌트 사용 (각자 Transformer 포함)
  const renderShape = (shape: Shape) => {
    const isSelected = selectedIds.includes(shape.id);

    switch (shape.type) {
      case 'rect': {
        return (
          <Rectangle
            key={shape.id}
            shapeProps={shape as RectShape}
            isSelected={isSelected}
            onSelect={() => selectNode(shape.id)}
            onChange={(newAttrs) => updateNode(shape.id, newAttrs)}
          />
        );
      }

      case 'circle': {
        return (
          <CircleShapeComponent
            key={shape.id}
            shapeProps={shape as CircleShape}
            isSelected={isSelected}
            onSelect={() => selectNode(shape.id)}
            onChange={(newAttrs) => updateNode(shape.id, newAttrs)}
          />
        );
      }

      case 'text': {
        return (
          <TextShapeComponent
            key={shape.id}
            shapeProps={shape as TextShape}
            isSelected={isSelected}
            onSelect={() => selectNode(shape.id)}
            onChange={(newAttrs) => updateNode(shape.id, newAttrs)}
          />
        );
      }

      case 'image': {
        return (
          <ImageShapeComponent
            key={shape.id}
            shapeProps={shape as ImageShape}
            isSelected={isSelected}
            onSelect={() => selectNode(shape.id)}
            onChange={(newAttrs) => updateNode(shape.id, newAttrs)}
          />
        );
      }

      case 'line': {
        const lineShape = shape as LineShape;
        return (
          <Line
            key={shape.id}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            points={lineShape.points}
            stroke={lineShape.stroke || '#000000'}
            strokeWidth={lineShape.strokeWidth || 2}
            draggable
            onClick={() => selectNode(shape.id)}
          />
        );
      }

      case 'arrow': {
        const arrowShape = shape as LineShape;
        return (
          <Arrow
            key={shape.id}
            id={shape.id}
            x={shape.x}
            y={shape.y}
            points={arrowShape.points}
            stroke={arrowShape.stroke || '#000000'}
            strokeWidth={arrowShape.strokeWidth || 2}
            pointerLength={10}
            pointerWidth={10}
            draggable
            onClick={() => selectNode(shape.id)}
          />
        );
      }

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-2">프로젝트 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="canvas-container border-2 border-gray-700 rounded-lg shadow-lg overflow-auto">
      <Stage
        ref={stageRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ background }}
      >
        <Layer>
          {/* 배경 */}
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={background}
            listening={false}
          />

          {/* 디자인 요소들 렌더링 (각 컴포넌트가 자체 Transformer 포함) */}
          {nodes.map(renderShape)}
        </Layer>
      </Stage>
    </div>
  );
}
