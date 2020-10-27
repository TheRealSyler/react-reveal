/*
 * React-reveal Wrap Helper
 *
 * Copyright © Roman Nosov 2018
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { ReactNode, Children, Fragment } from 'react';
import RevealBase from '../RevealBase';
import { Effect, MakeArgs } from '../utils';

// TODO add better types to function parameters.
function wrap(
  props: Partial<MakeArgs>,
  inEffect: Effect,
  outEffect: Effect | false,
  children?: ReactNode
) {
  //@ts-ignore
  if ('in' in props) props.when = props.in;

  if (Children.count(children) < 2) {
    return <RevealBase {...props} inEffect={inEffect} outEffect={outEffect} children={children} />;
  }

  children = Children.map(children, (child) => (
    <RevealBase {...props} inEffect={inEffect} outEffect={outEffect} children={child} />
  ));

  return 'Fragment' in React ? <Fragment>{children}</Fragment> : <span>{children}</span>;
}

export default wrap;
