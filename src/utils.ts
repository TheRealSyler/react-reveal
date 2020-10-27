import { CSSProperties, FunctionComponent } from 'react';

export interface MakeArgs {
  duration: number;
  delay: number;
  count: number;
  distance: number;
  forever?: boolean;
  left: boolean;
  right: boolean;
  x?: boolean;
  y?: boolean;
  up: boolean;
  down: boolean;
  top: boolean;
  bottom: boolean;
  big: boolean;
  mirror: boolean;
  opposite: boolean;
}

export type Make = (reverse: boolean, args: Partial<MakeArgs>) => string;

export interface Effect {
  make: Make;
  duration: number;
  delay: number;
  count: number;
  forever?: boolean;
  style: Partial<CSSProperties>;
  reverse?: boolean;
}

export type Lookup = { [key: number]: string };

export interface DirectionProps {
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottom?: boolean;
}

/**
 * @duration: number;
 * @timeout: number;
 * @delay: number;
 * @count: number;
 * @forever: boolean;
 */
export interface BaseProps {
  duration: number;
  timeout: number;
  delay: number;
  count: number;
  forever: boolean;
}

export type SimpleComponent = FunctionComponent<Partial<BaseProps>>;
