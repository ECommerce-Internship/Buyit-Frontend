import { useState } from 'react';
import type {
  ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode,
} from 'react';

/**
 * Hoverable — a tiny polymorphic element that reproduces the source design's
 * inline `style-hover` / `style-focus` behaviour. The base `style` is merged
 * with `hoverStyle` while hovered and `focusStyle` while focused, so the exact
 * inline values from the original design are preserved (no CSS classes needed).
 *
 * Usage:
 *   <Hoverable as="button" style={base} hoverStyle={{ transform: 'translateY(-2px)' }}>…</Hoverable>
 *   <Hoverable as="a" href="#x" style={link} hoverStyle={{ color: '#fff' }}>…</Hoverable>
 */
type HoverableProps<T extends ElementType> = {
  as?: T;
  style?: CSSProperties;
  hoverStyle?: CSSProperties;
  focusStyle?: CSSProperties;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'style' | 'children'>;

export function Hoverable<T extends ElementType = 'div'>({
  as,
  style,
  hoverStyle,
  focusStyle,
  children,
  ...rest
}: HoverableProps<T>) {
  const Tag = (as || 'div') as ElementType;
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);

  const merged: CSSProperties = {
    ...style,
    ...(hover && hoverStyle ? hoverStyle : null),
    ...(focus && focusStyle ? focusStyle : null),
  };

  // Pull any caller-supplied handlers off `rest` so we can call them *after*
  // toggling our hover/focus state (typed, so no `any` casts are needed).
  const passed = rest as {
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
  };

  return (
    <Tag
      {...rest}
      style={merged}
      onMouseEnter={(e: React.MouseEvent) => { setHover(true); passed.onMouseEnter?.(e); }}
      onMouseLeave={(e: React.MouseEvent) => { setHover(false); passed.onMouseLeave?.(e); }}
      onFocus={(e: React.FocusEvent) => { setFocus(true); passed.onFocus?.(e); }}
      onBlur={(e: React.FocusEvent) => { setFocus(false); passed.onBlur?.(e); }}
    >
      {children}
    </Tag>
  );
}
