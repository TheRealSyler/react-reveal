/*
 * withReveal Auxiliary Function For Making react-reveal Higher Order Components
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';

// TODO add better types.
interface Props {
  force: any;
  mountOnEnter: any;
  belowBreakpoint: any;
  toggle: any;
  isToggled: boolean;
  disabled: boolean;
  collapseOnly: boolean;
  unmountOnExit: any;
  opposite: any;
  mirror: any;
  wait: any;
  onReveal: any;
  in: any;
  when: any;
  spy: any;
  collapse: any;
  onExited: any;
  enter: any;
  exit: any;
  appear: any;
}

//  TODO add arg types
function withReveal(WrappedComponent: any, effect: any) {
  let refProp: undefined | string = undefined;
  if (
    typeof WrappedComponent === 'function' &&
    typeof WrappedComponent.styledComponentId === 'string'
  )
    refProp = 'innerRef';
  return function ({
    force,
    mountOnEnter,
    unmountOnExit,
    opposite,
    mirror,
    wait,
    onReveal,
    in: inProp,
    when,
    spy,
    collapse,
    onExited,
    enter,
    exit,
    appear,
    //disableObserver,
    ...props
  }: Partial<Props>) {
    return (
      <effect.type
        force={force}
        mountOnEnter={mountOnEnter}
        unmountOnExit={unmountOnExit}
        opposite={opposite}
        mirror={mirror}
        wait={wait}
        onReveal={onReveal}
        in={inProp}
        when={when}
        spy={spy}
        collapse={collapse}
        onExited={onExited}
        enter={enter}
        exit={exit}
        appear={appear}
        //disableObserver={disableObserver}
        {...effect.props}
        refProp={refProp}
      >
        <WrappedComponent {...props} />
      </effect.type>
    );
  };
}

export default withReveal;
