/*
 * Fade React Component
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { animation, defaults } from '../lib/globals';
import wrap from '../lib/wrap';
import { FunctionComponent } from 'react';
import { Lookup, Make, Effect, DirectionProps, BaseProps } from '../utils';

interface FadeProps extends DirectionProps, BaseProps {
  out: boolean;
  big: boolean;
  mirror: boolean;
  opposite: boolean;
  distance: string;
}

const lookup: Lookup = {};

const make: Make = (
  reverse,
  { distance, left, right, up, down, top, bottom, big, mirror, opposite }
) => {
  const checksum =
    (distance ? +distance.toString() : 0) +
    ((left ? 1 : 0) |
      (right ? 2 : 0) |
      (top || down ? 4 : 0) |
      (bottom || up ? 8 : 0) |
      (mirror ? 16 : 0) |
      (opposite ? 32 : 0) |
      (reverse ? 64 : 0) |
      (big ? 128 : 0));

  if (lookup.hasOwnProperty(checksum)) return lookup[checksum];

  const transform = left || right || up || down || top || bottom;
  let x, y;
  if (transform) {
    // Boolean XOR
    if (!mirror !== !(reverse && opposite))
      [left, right, top, bottom, up, down] = [right, left, bottom, top, down, up];
    const dist = distance || (big ? '2000px' : '100%');
    x = left ? '-' + dist : right ? dist : '0';
    y = down || top ? '-' + dist : up || bottom ? dist : '0';
  }
  lookup[checksum] = animation(
    `${!reverse ? 'from' : 'to'} {opacity: 0;${
      transform ? ` transform: translate3d(${x}, ${y}, 0);` : ''
    }}
     ${reverse ? 'from' : 'to'} {opacity: 1;transform: none;} `
  );
  return lookup[checksum];
};

const Fade: FunctionComponent<Partial<FadeProps>> = (
  {
    children,
    out,
    forever,
    timeout,
    duration = defaults.duration,
    delay = defaults.delay,
    count = defaults.count,
    ...props
  } = defaults,
  context = false
) => {
  const effect: Effect = {
    make,
    duration: timeout === undefined ? duration : timeout,
    delay,
    forever,
    count,
    style: { animationFillMode: 'both' },
    reverse: props.left,
  };
  return (context ? wrap(props as any, effect, effect, children) : effect) as any; // TODO add better types
};

export default Fade;
