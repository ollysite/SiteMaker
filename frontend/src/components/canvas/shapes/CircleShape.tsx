/**
 * 원 컴포넌트 (Transformer 포함)
 */

import { useRef, useEffect } from 'react';
import { Circle, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { CircleShape as CircleShapeType } from '../../../types/canvas';

interface CircleShapeProps {
  shapeProps: CircleShapeType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CircleShapeType>) => void;
}

export default function CircleShape({ shapeProps, isSelected, onSelect, onChange }: CircleShapeProps) {
  const shapeRef = useRef<Konva.Circle>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Circle
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          
          // 원은 비율 유지하므로 scaleX만 사용
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            radius: Math.max(5, shapeProps.radius * scaleX),
            rotation: node.rotation(),
          });
        }}
      />

      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          // 원은 비율 유지
          keepRatio={true}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
