/**
 * 이미지 컴포넌트 (Transformer + 비율 유지)
 */

import { useRef, useEffect } from 'react';
import { Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import type { ImageShape as ImageShapeType } from '../../../types/canvas';

interface ImageShapeProps {
  shapeProps: ImageShapeType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageShapeType>) => void;
}

export default function ImageShape({ shapeProps, isSelected, onSelect, onChange }: ImageShapeProps) {
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // 이미지 로드
  const [img, status] = useImage(shapeProps.src, 'anonymous');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (status === 'loading') {
    return null;
  }

  if (status === 'failed') {
    console.error('이미지 로드 실패:', shapeProps.src);
    return null;
  }

  const width = shapeProps.width || img?.width || 100;
  const height = shapeProps.height || img?.height || 100;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        id={shapeProps.id}
        image={img}
        x={shapeProps.x}
        y={shapeProps.y}
        width={width}
        height={height}
        rotation={shapeProps.rotation || 0}
        scaleX={shapeProps.scaleX || 1}
        scaleY={shapeProps.scaleY || 1}
        opacity={shapeProps.opacity || 1}
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
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(10, node.width() * scaleX),
            height: Math.max(10, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />

      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          // 이미지는 비율 유지 권장
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
