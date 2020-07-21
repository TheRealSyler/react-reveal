/*
 * Jump React Component
 *
 * Copyright © Roman Nosov 2017
 * Original CSS Effect - Copyright (c) 2016 Daniel Eden
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import wrap from '../lib/wrap';
import { animation, defaults } from '../lib/globals';
import { Make, SimpleComponent, Effect } from '../utils';

const rule = `
 from, 20%, 53%, 80%, to {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    transform: translate3d(0,0,0);
  }

  40%, 43% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -30px, 0);
  }

  70% {
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    transform: translate3d(0, -15px, 0);
  }

  90% {
    transform: translate3d(0, -4px, 0);
}
`;

let name: string | false = false;
const make: Make = () => {
  return name || (name = animation(rule));
};

const Jump: SimpleComponent = ({
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

export default Jump;
