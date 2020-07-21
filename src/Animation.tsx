/*
 * Animation Component For react-reveal
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Stepper from './lib/Stepper';

interface AnimationProps {
  steps: Stepper;
}

class Animation extends React.Component<AnimationProps> {
  stepper: Stepper;
  constructor(props: AnimationProps) {
    super(props);
    this.stepper = props.steps;
  }

  getChildContext() {
    return { stepper: this.stepper };
  }

  static step(name: string, after?: number) {
    return new Stepper().step(name, after);
  }

  render() {
    const { steps, children, ...props } = this.props;
    return React.cloneElement(React.Children.only(children) as any, props);
  }
}

export default Animation;
