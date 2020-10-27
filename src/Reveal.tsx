/*
 * Reveal React Component
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { defaults } from './lib/globals';
import wrap from './lib/wrap';
import Fade from './in-and-out/Fade';
import { FunctionComponent } from 'react';
import { BaseProps, Effect } from './utils';

interface RevealProps extends BaseProps {
  in: {}; // TODO Add better types
  out: {} | [false]; // TODO Add better types
  effect: string;
  effectOut: string;
  durationOut: number;
  delayOut: number;
  countOut: number;
  foreverOut: boolean;
  inEffect: Effect;
  outEffect: Effect;
}

const defaultProps = {
  ...defaults,
  durationOut: defaults.duration,
  delayOut: defaults.delay,
  countOut: defaults.count,
  foreverOut: defaults.forever,
  inEffect: (Fade(defaults) as any) as Effect,
  outEffect: (Fade({ out: true, ...defaults }) as any) as Effect,
};

const Reveal: FunctionComponent<Partial<RevealProps>> = ({
  children,
  timeout,
  duration,
  delay,
  count,
  forever,
  durationOut,
  delayOut,
  countOut,
  foreverOut,
  effect,
  effectOut,
  inEffect,
  outEffect,
  ...props
}) => {
  function factory(reverse: boolean) {
    return reverse
      ? effectOut
        ? {
            duration: durationOut,
            delay: delayOut,
            count: countOut,
            forever: foreverOut,
            className: effectOut,
            style: {},
          }
        : outEffect
      : effect
      ? {
          duration: timeout === undefined ? duration : timeout,
          delay,
          count,
          forever,
          className: effect,
          style: {},
        }
      : inEffect;
  }
  // TODO remove type assertions
  return wrap(props as any, factory(false) as any, factory(true) as any, children);
};

Reveal.defaultProps = defaultProps;
export default Reveal;
