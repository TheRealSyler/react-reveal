/*
 * makeCarousel Higher Order Component For react-reveal
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';

import swipeDetect, { Direction } from './swipeDetect';

interface Props {
  defaultWait: number;
  maxTurns: number;
  swipe: boolean;
}

interface State {
  current: number;
  next: number;
  backwards: boolean;
  swap: boolean;
  appear: boolean;
}

// TODO add better param type
function makeCarousel(WrappedComponent: any, config: Partial<Props> = {}) {
  //const { wait = 5000,  maxTurns = 2, } = config;

  return class extends React.Component<Props, State> {
    static get defaultProps() {
      return {
        defaultWait: config.defaultWait || 5000,
        maxTurns: config.maxTurns || 5,
        swipe: config.swipe || true,
      };
    }
    turn = 0;
    stop = false;
    beforeNode: any = null; // TODO find better types
    afterNode: any = null;
    constructor(props: Props) {
      super(props);
      this.state = {
        //next: React.Children.count(this.props.children) - 1,
        current: 0,
        next: 1,
        backwards: false,
        swap: false,
        appear: false,
      };

      this.target = this.target.bind(this);
    }

    target({ currentTarget }: { currentTarget: HTMLElement }) {
      this.move(+currentTarget.getAttribute('data-position')!);
    }

    handleReveal = () => {
      if (this.turn >= this.props.maxTurns) return;
      this.move(this.state.current + 1);
    };

    componentWillUnmount() {
      this.turn = -1;
    }

    move(newPos: any) {
      if (this.turn < 0 || newPos === this.state.current) return;
      let pos = newPos;
      const count = React.Children.count(this.props.children);
      if (newPos >= count) {
        this.turn++;
        pos = 0;
      } else if (newPos < 0) pos = count - 1;
      this.setState({
        current: pos,
        next: this.state.current,
        backwards: newPos < this.state.current,
        swap: !this.state.swap,
        appear: true,
      });
    }

    handleSwipe = (dir: Direction) => {
      if (!this.props.swipe) return;
      if (dir === 'left') this.move(this.state.current + 1);
      else if (dir === 'right') this.move(this.state.current - 1);
    };

    componentDidMount() {
      if (this.beforeNode && this.afterNode) {
        swipeDetect(this.beforeNode, this.handleSwipe);
        swipeDetect(this.afterNode, this.handleSwipe);
      }
    }

    render() {
      const { children } = this.props,
        arr = React.Children.toArray(children),
        count = arr.length;
      let { swap, next, current, backwards } = this.state;
      current %= count;
      next %= count;
      let before: any; // TODO find better type
      let after: any;

      switch (count) {
        case 0:
          before = <div />;
          after = <div />;
        case 1:
          before = arr[0];
          after = arr[0];
        default:
          before = arr[swap ? next : current];
          after = arr[swap ? current : next];
      }

      if (typeof before !== 'object') before = <div>{before}</div>;
      if (typeof after !== 'object') after = <div>{after}</div>;

      return (
        <WrappedComponent
          {...this.props}
          position={current}
          handleClick={this.target}
          total={count}
          children={[
            <div
              ref={(node) => (this.beforeNode = node)}
              key={1}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: swap ? 1 : 2,
              }}
            >
              <before.type
                //disableObserver
                //force
                mountOnEnter
                unmountOnExit
                appear={this.state.appear}
                wait={this.props.defaultWait}
                {...before.props}
                opposite
                when={!swap}
                mirror={backwards}
                onReveal={!swap /*&&!this.stop*/ ? this.handleReveal : void 0}
              />
            </div>,
            <div
              key={2}
              ref={(node) => (this.afterNode = node)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: swap ? 2 : 1,
              }}
            >
              <after.type
                //disableObserver
                //force
                mountOnEnter
                unmountOnExit
                appear={this.state.appear}
                wait={this.props.defaultWait}
                {...after.props}
                opposite
                when={swap}
                mirror={backwards}
                onReveal={swap /*&&!this.stop*/ ? this.handleReveal : void 0}
              />
            </div>,
          ]}
        />
      );
    }
  };
}

export default makeCarousel;
