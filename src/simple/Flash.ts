/*
 * Flash React Component
 *
 * Copyright © Roman Nosov 2017
 * Original CSS Effect - Copyright (c) 2016 Daniel Eden
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import wrap from '../lib/wrap';
import { animation, defaults } from '../lib/globals';
import { Effect, Make, SimpleComponent } from '../utils';

const rule = `
from, 50%, to {
    opacity: 1;
  }

  25%, 75% {
    opacity: 0;
}
`;

let name: string | false = false;
const make: Make = () => {
  return name || (name = animation(rule));
};

const Flash: SimpleComponent = ({
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
    count,
    forever,
    style: { animationFillMode: 'both' },
  };
  return wrap(props, effect, false, children);
};

export default Flash;
