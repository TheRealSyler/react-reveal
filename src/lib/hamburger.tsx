/*
 * Hamburger Higher Order Component For react-reveal
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import responsive from './responsive';
import makeIcon, { HamburgerIconProps } from './HamburgerIcon';
import { animation } from './globals';
import Fade from '../in-and-out/Fade';

interface HamburgerConfig {
  duration?: number;
}

function hamburger(WrappedComponent: JSX.Element, config: HamburgerConfig = {}) {
  let responsiveNode: any; // TODO add better types.

  function icon(iconProps: HamburgerIconProps) {
    if (!responsiveNode || responsiveNode.state.match) return void 0;
    return makeIcon(
      responsiveNode.state.isClicked,
      animation,
      responsiveNode.handleClick,
      iconProps
    );
  }

  if ('duration' in config) config.duration! *= 3;

  const ResponsiveComponent = responsive(WrappedComponent, {
    ...config,
    effect: <Fade {...config} />,
  });

  return (props: any) => {
    return (
      <ResponsiveComponent
        icon={icon}
        disableAboveBreakpoint
        {...props}
        ref={(node) => (responsiveNode = node)}
      />
    );
  };
}

export default hamburger;
