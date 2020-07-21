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

interface RevealProps {
  in: {}; // TODO Add better types
  out: {} | [false]; // TODO Add better types
  effect: string;
  effectOut: string;
  duration: number;
  timeout: number;
  delay: number;
  count: number;
  forever: boolean;
  durationOut: number;
  delayOut: number;
  countOut: number;
  foreverOut: boolean;
  inEffect: any; // TODO Add better types
  outEffect: any; // TODO Add better types
}

const defaultProps = {
  ...defaults,
  durationOut: defaults.duration,
  delayOut: defaults.delay,
  countOut: defaults.count,
  foreverOut: defaults.forever,
  inEffect: Fade(defaults),
  outEffect: Fade({ out: true, ...defaults }),
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

  return wrap(props, factory(false), factory(true), children);
};

Reveal.defaultProps = defaultProps;
export default Reveal;
