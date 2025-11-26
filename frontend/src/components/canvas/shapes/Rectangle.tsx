/**
 * 사각형 컴포넌트 (Transformer 포함)
 * 클릭 선택 + 드래그 이동 + 리사이즈 + 회전 지원
 */

import { useRef, useEffect } from 'react';
import { Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { RectShape } from '../../../types/canvas';

interface RectangleProps {
  shapeProps: RectShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<RectShape>) => void;
}

export default function Rectangle({ shapeProps, isSelected, onSelect, onChange }: RectangleProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // 선택 시 Transformer 부착
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        
        // 드래그 완료 시 위치 업데이트
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        
        // 변형 완료 시 크기/회전 업데이트
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // 스케일을 1로 리셋하고 실제 크기로 변환
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />

      {/* 선택 시 Transformer 표시 */}
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // 최소 크기 제한
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
