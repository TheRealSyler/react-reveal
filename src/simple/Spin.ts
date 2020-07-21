/*
 * Spin React Component
 *
 * Copyright © Roman Nosov 2017
 * CSS Effect - Copyright (c) 2016 Daniel Eden
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import wrap from '../lib/wrap';
import { animation, defaults } from '../lib/globals';
import { Make, SimpleComponent, Effect } from '../utils';

const rule = `
from {
    transform: rotate(360deg);
    animation-timing-function: linear;
  }

to {
  transform: rotate(0deg);
}
`;

let name: string | false = false;
const make: Make = () => {
  return name || (name = animation(rule));
};

const Spin: SimpleComponent = ({
  children,
  timeout,
  duration = defaults.duration,
  delay = defaults.delay,
  count = defaults.count,
  forever,
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
  return wrap(props, effect, false, children);
};

export default Spin;
