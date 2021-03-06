/*
 * Roll React Component
 *
 * Copyright © Roman Nosov 2017
 * CSS effect originally authored by Nick Pettit - https://github.com/nickpettit/glide
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import wrap from '../lib/wrap';
import { animation, defaults } from '../lib/globals';
import { FunctionComponent } from 'react';
import { Lookup, Make, Effect } from '../utils';

interface RollProps {
  out: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  big: boolean;
  mirror: boolean;
  opposite: boolean;
  duration: number;
  timeout: number;
  delay: number;
  count: number;
  forever: boolean;
}

const lookup: Lookup = {};
const make: Make = (reverse, { left, right, up, down, top, bottom, big, mirror, opposite }) => {
  const checksum =
    (left ? 1 : 0) |
    (right ? 2 : 0) |
    (top || down ? 4 : 0) |
    (bottom || up ? 8 : 0) |
    (mirror ? 16 : 0) |
    (opposite ? 32 : 0) |
    (reverse ? 64 : 0) |
    (big ? 128 : 0);
  if (lookup.hasOwnProperty(checksum)) return lookup[checksum];
  // Boolean XOR
  if (!mirror !== !(reverse && opposite))
    [left, right, top, bottom, up, down] = [right, left, bottom, top, down, up];
  const dist = big ? '2000px' : '100%',
    x = left ? '-' + dist : right ? dist : '0',
    y = down || top ? '-' + dist : up || bottom ? dist : '0';
  lookup[checksum] = animation(`
    ${
      !reverse ? 'from' : 'to'
    } {opacity: 0;transform: translate3d(${x}, ${y}, 0) rotate3d(0, 0, 1, -120deg);}
	  ${reverse ? 'from' : 'to'} {opacity: 1;transform: none}
  `);
  return lookup[checksum];
};

const Roll: FunctionComponent<Partial<RollProps>> = ({
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

export default Roll;
