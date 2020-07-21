/*
 * Rotate React Component
 *
 * Copyright © Roman Nosov 2017
 * Original CSS Effect - Copyright (c) 2016 Daniel Eden
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import wrap from '../lib/wrap';
import { animation, defaults } from '../lib/globals';
import { FunctionComponent } from 'react';
import { Lookup, Make, Effect } from '../utils';

interface RotateProps {
  out: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  mirror: boolean;
  opposite: boolean;
  duration: number;
  timeout: number;
  delay: number;
  count: number;
  forever: boolean;
}

const lookup: Lookup = {};

const make: Make = (reverse, { left, right, up, down, top, bottom, mirror, opposite }) => {
  const checksum =
    (left ? 1 : 0) |
    (right ? 2 : 0) |
    (top || down ? 4 : 0) |
    (bottom || up ? 8 : 0) |
    (mirror ? 16 : 0) |
    (opposite ? 32 : 0) |
    (reverse ? 64 : 0);
  if (lookup.hasOwnProperty(checksum)) return lookup[checksum];
  if (!mirror !== !(reverse && opposite))
    // Boolean XOR
    [left, right, top, bottom, up, down] = [right, left, bottom, top, down, up];
  let angle = '-200deg',
    origin = 'center';
  if ((down || top) && left) angle = '-45deg';
  if (((down || top) && right) || ((up || bottom) && left)) angle = '45deg';
  if ((up || bottom) && right) angle = '-90deg';
  if (left || right) origin = (left ? 'left' : 'right') + ' bottom';
  lookup[checksum] = animation(`
    ${
      !reverse ? 'from' : 'to'
    } { opacity: 0; transform-origin: ${origin}; transform: rotate3d(0, 0, 1, ${angle});}
    ${reverse ? 'from' : 'to'} { opacity: 1; transform-origin: ${origin}; transform: none;}
  `);
  return lookup[checksum];
};

const Rotate: FunctionComponent<Partial<RotateProps>> = ({
  children,
  out,
  forever,
  timeout,
  duration = defaults.duration,
  delay = defaults.delay,
  count = defaults.count,
  ...props
} = defaults) => {
  const effect: Effect = {
    make,
    duration: timeout === undefined ? duration : timeout,
    delay,
    forever,
    count,
    style: { animationFillMode: 'both' },
  };
  return wrap(props, effect, effect, children);
};

export default Rotate;
