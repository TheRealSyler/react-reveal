/*
 * LightSpeed React Component
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

interface LightSpeedProps {
  out: boolean;
  left: boolean;
  right: boolean;
  mirror: boolean;
  opposite: boolean;
  duration: number;
  timeout: number;
  delay: number;
  count: number;
  forever: boolean;
}

const lookup: Lookup = {};

const make: Make = (reverse, { left, right, mirror, opposite }) => {
  const checksum =
    (left ? 1 : 0) | (right ? 2 : 0) | (mirror ? 16 : 0) | (opposite ? 32 : 0) | (reverse ? 64 : 0);
  if (lookup.hasOwnProperty(checksum)) return lookup[checksum];
  if (!mirror !== !(reverse && opposite))
    // Boolean XOR
    [left, right] = [right, left];
  const dist = '100%',
    x = left ? '-' + dist : right ? dist : '0';
  const rule = !reverse
    ? `from {
        transform: translate3d(${x}, 0, 0) skewX(-30deg);
        opacity: 0;
      }
      60% {
        transform: skewX(20deg);
        opacity: 1;
      }
      80% {
        transform: skewX(-5deg);
        opacity: 1;
      }
      to {
        transform: none;
        opacity: 1;
      }`
    : `from {
        opacity: 1;
      }
      to {
        transform: translate3d(${x}, 0, 0) skewX(30deg);
        opacity: 0;
      }
    `;
  lookup[checksum] = animation(rule);
  return lookup[checksum];
};

const LightSpeed: FunctionComponent<Partial<LightSpeedProps>> = ({
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
  // const checksum =
  //   0 +
  //   (props.left ? 1 : 0) +
  //   (props.right ? 10 : 0) +
  //   (props.mirror ? 10000 : 0) +
  //   (props.opposite ? 100000 : 0);
  return wrap(props, effect, effect, children);
};

export default LightSpeed;
