/**
 * URL 이미지 로더 컴포넌트
 * Konva는 URL 문자열을 바로 그릴 수 없으므로 Image 객체로 변환
 */

import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type { ImageShape } from '../../types/canvas';

interface URLImageProps {
  shape: ImageShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ImageShape>) => void;
}

export default function URLImage({ shape, isSelected, onSelect, onChange }: URLImageProps) {
  // useImage 훅이 비동기로 이미지를 로드하고 캐싱
  const [img, status] = useImage(shape.src, 'anonymous');

  if (status === 'loading') {
    // 로딩 중 플레이스홀더
    return null;
  }

  if (status === 'failed') {
    console.error('이미지 로드 실패:', shape.src);
    return null;
  }

  const width = shape.width || img?.width || 100;
  const height = shape.height || img?.height || 100;

  return (
    <KonvaImage
      id={shape.id}
      image={img}
      x={shape.x}
      y={shape.y}
      width={width}
      height={height}
      rotation={shape.rotation || 0}
      scaleX={shape.scaleX || 1}
      scaleY={shape.scaleY || 1}
      opacity={shape.opacity || 1}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        onChange({
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
    />
  );
}
