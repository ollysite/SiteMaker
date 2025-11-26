/**
 * 텍스트 컴포넌트 (Transformer + 더블클릭 편집)
 */

import { useRef, useEffect, useState } from 'react';
import { Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { TextShape as TextShapeType } from '../../../types/canvas';

interface TextShapeProps {
  shapeProps: TextShapeType;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<TextShapeType>) => void;
}

export default function TextShape({ shapeProps, isSelected, onSelect, onChange }: TextShapeProps) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current && !isEditing) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, isEditing]);

  // 더블클릭 시 텍스트 편집
  const handleDblClick = () => {
    const node = shapeRef.current;
    if (!node) return;

    setIsEditing(true);

    const stage = node.getStage();
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const textPosition = node.absolutePosition();

    // 텍스트 영역 생성
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = shapeProps.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPosition.y}px`;
    textarea.style.left = `${stageBox.left + textPosition.x}px`;
    textarea.style.width = `${node.width() * node.scaleX() + 20}px`;
    textarea.style.height = `${node.height() * node.scaleY() + 20}px`;
    textarea.style.fontSize = `${shapeProps.fontSize || 16}px`;
    textarea.style.fontFamily = shapeProps.fontFamily || 'Arial';
    textarea.style.color = shapeProps.fill || '#000000';
    textarea.style.border = '2px solid #6366f1';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '4px';
    textarea.style.outline = 'none';
    textarea.style.background = 'white';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';

    textarea.focus();

    const removeTextarea = () => {
      textarea.remove();
      setIsEditing(false);
    };

    textarea.addEventListener('blur', () => {
      onChange({ text: textarea.value });
      removeTextarea();
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        onChange({ text: textarea.value });
        removeTextarea();
      }
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });
  };

  return (
    <>
      <Text
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        visible={!isEditing}
        
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
            width: node.width() * scaleX,
            fontSize: Math.max(8, (shapeProps.fontSize || 16) * scaleY),
            rotation: node.rotation(),
          });
        }}
      />

      {isSelected && !isEditing && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
          }}
        />
      )}
    </>
  );
}
