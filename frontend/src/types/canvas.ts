/**
 * 캔버스 요소 타입 정의
 */

export type ShapeType = 'rect' | 'circle' | 'text' | 'image' | 'line' | 'arrow';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  draggable?: boolean;
}

export interface RectShape extends BaseShape {
  type: 'rect';
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fill?: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
}

export interface ImageShape extends BaseShape {
  type: 'image';
  src: string;
  width?: number;
  height?: number;
}

export interface LineShape extends BaseShape {
  type: 'line' | 'arrow';
  points: number[];
  stroke?: string;
  strokeWidth?: number;
}

export type Shape = RectShape | CircleShape | TextShape | ImageShape | LineShape;

export interface CanvasData {
  layers: Shape[];
  background?: string;
  width: number;
  height: number;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  canvas_data: CanvasData;
  width: number;
  height: number;
  thumbnail_data?: string;
  created_at: string;
  updated_at: string;
  version: number;
}
