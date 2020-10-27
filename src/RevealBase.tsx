/*
 * RevealBase Component For react-reveal
 *
 * Copyright © Roman Nosov 2016, 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { CSSProperties, Component } from 'react';
import {
  namespace,
  ssr,
  disableSsr,
  globalHide,
  hideAll,
  cascade,
  collapseend,
  fadeOutEnabled,
  observerMode,
  raf,
} from './lib/globals';
import { Effect, MakeArgs } from './utils';
//import Step from './lib/Step';
//import throttle from './lib/throttle';

//childContextTypes = {
//  transitionGroup: ()=>{},
//};

interface RevealBaseContext {
  transitionGroup: object;
}

interface InOut {
  make: (reverse: boolean, args: MakeArgs) => string; //? TODO Add better types
  duration: number;
  delay: number;
  forever: boolean;
  count: number;
  style: Partial<CSSProperties>;
  reverse: boolean;
  className?: string;
}

interface RevealBaseProps extends Partial<MakeArgs> {
  props?: RevealBaseProps;
  //when: any,
  spy?: boolean;
  //margin: number,
  collapse?: boolean; // oneOfType([bool, shape({ tag: string, props: object })]), // TODO Add better types
  collapseEl?: HTMLElement; // TODO Add better types
  cascade?: boolean;
  wait?: number;
  //    step: oneOfType([instanceOf(Step), string]),
  force?: boolean;
  disabled?: boolean;
  appear?: boolean;
  enter?: boolean;
  exit?: boolean;
  fraction?: number;
  //children: element.isRequired,
  refProp?: string;
  innerRef?: (node: HTMLElement) => void; // TODO Add better types
  onReveal?: () => void; // TODO Add better types
  //onEnter: func,
  //onEntering: func,
  //onEntered: func,
  //onExit: func,
  //onExiting: func,
  onExited?: () => void;
  unmountOnExit?: boolean;
  mountOnEnter?: boolean;
  inEffect: Effect;
  outEffect: Effect | false; //? TODO Add better types
  ssrReveal?: boolean;
  collapseOnly?: boolean;
  ssrFadeout?: boolean;
  style?: Style;
  className?: string;
  when?: boolean;
}

type Style = Partial<
  CSSProperties & {
    animationName: string | InOut['make'];
  }
>;

interface RevealBaseState {
  collapse?: Partial<CSSProperties>;
  style: Style;
  hasExited?: boolean;
  hasAppeared?: boolean;
  className?: string;
}

type AnimEnd = {
  forever: boolean;
  count: number;
  delay: number;
  duration: number;
};

interface ChildElement {
  type: string;
  key: string | null;
  ref: () => void | null;
  props: { children: null | ChildElement } & Partial<RevealBaseProps>;
}

interface Props extends Partial<MakeArgs> {
  inEffect: Effect;
  outEffect: Effect | false; //? TODO Add better types
}

interface State {
  style: Style;
}

class RevealBase extends Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      style: {
        animationName: props.inEffect.make(false, props),
        ...this.props.inEffect.style,
        animationDuration: `${this.props.inEffect.duration}ms`,
        animationDelay: `${this.props.inEffect.delay}ms`,
        animationIterationCount: this.props.inEffect.forever
          ? 'infinite'
          : this.props.inEffect.count,
        opacity: 0,
      },
    };
  }

  getChild() {
    if (typeof this.props.children === 'object') {
      const child = React.Children.only(this.props.children)!;

      if ('type' in child && typeof child.type === 'string') {
        return child;
      } else {
        return <div>{child}</div>;
      }
    } else return <div>{this.props.children}</div>;
  }

  render() {
    const child = this.getChild();

    return <child.type style={this.state.style}>{child.props.children}</child.type>;
  }
}

class a {
  static getInitialCollapseStyle(props: RevealBaseProps): Partial<CSSProperties> {
    return {
      height: 0,
      visibility: props.when ? void 0 : 'hidden',
    };
  }

  static getTop(el: any): number {
    while (el.offsetTop === void 0) el = el.parentNode;
    let top = el.offsetTop;
    for (; el.offsetParent; top += el.offsetTop) el = el.offsetParent;
    return top;
  }
}

// @ts-ignore
class RevealBaseOld extends Component<RevealBaseProps, RevealBaseState> {
  //getChildContext() {
  //  return { transitionGroup: null }; // allows for nested Transitions
  //}
  savedChild: ChildElement | false;
  isShown: boolean;
  isOn: boolean;
  revealHandler?: (e: Event) => void = undefined;
  resizeHandler?: (e: Event) => void = undefined;
  el?: HTMLElement; //? TODO Add better types
  childRef?: (node: HTMLElement) => void = undefined; //? TODO Add better types
  animationEndTimeout?: void | number;
  onRevealTimeout?: void | number;
  ticking?: boolean;
  isListener?: boolean;

  observer: IntersectionObserver | null = null;

  constructor(props: RevealBaseProps, context: RevealBaseContext) {
    super(props, context);

    console.log('CONSTRUCTOR');
    this.isOn = props.when !== undefined ? !!props.when : true;
    this.state = {
      collapse: props.collapse //&& (props.appear || (context.transitionGroup&&!context.transitionGroup.isMounting))
        ? a.getInitialCollapseStyle(props)
        : void 0,
      style: {
        opacity: (!this.isOn || props.ssrReveal) && props.outEffect ? 0 : void 0,
        //visibility: props.when  ? 'visible' : 'hidden',
      },
    };

    this.savedChild = false;
    //this.isListener = false;
    this.isShown = false;
    //this.ticking = false;
    //this.observerMode = observerMode && !this.props.disableObserver;
    if (!observerMode) {
      this.revealHandler = this.makeHandler(this.reveal);
      this.resizeHandler = this.makeHandler(this.resize);
    } else this.handleObserve = this.handleObserve.bind(this);
    //this.revealHandler = myThrottle(this.reveal.bind(this, false));
    //this.revealHandler = rafThrottle(this.reveal.bind(this, false));
    //this.revealHandler = rafThrottle(throttle(this.reveal.bind(this, false), 66));
    //this.revealHandler = throttle(rafThrottle(this.reveal.bind(this, false)), 66);
    //this.resizeHandler = throttle(this.resize.bind(this), 500);
    this.saveRef = this.saveRef.bind(this);
  }

  saveRef(node: HTMLElement) {
    if (this.childRef) this.childRef(node);
    if (this.props.innerRef) this.props.innerRef(node);
    //probably redundant check
    if (this.el !== node) {
      // TODO find a way to remove node as any
      this.el = node && 'offsetHeight' in (node as any) ? node : undefined;
      this.observe(this.props, true);
    }
  }

  invisible() {
    if (!this || !this.el) return;
    this.savedChild = false;
    if (!this.isShown) {
      this.setState({
        hasExited: true,
        collapse: this.props.collapse
          ? { ...this.state.collapse, visibility: 'hidden' }
          : undefined, // NOTE changed from null to undefined.
        style: {
          /*...this.state.style, visibility: 'hidden'*/ opacity: 0,
        } /*, collapsing: false */,
      });
      //if (this.props.onExited)
      //  this.props.onExited(this.el);
      if (!observerMode && this.props.collapse) window.document.dispatchEvent(collapseend);
    }
  }
  // TODO add better param types.
  animationEnd(
    func: () => void,
    cascade: boolean | undefined,
    { forever, count, delay, duration }: AnimEnd
  ) {
    if (forever) return;
    //const el = this.finalEl || this.el;
    const handler = () => {
      if (!this || !this.el) return;
      this.animationEndTimeout = void 0;
      //el.removeEventListener('animationend', handler);
      func.call(this);
    };
    this.animationEndTimeout = window.setTimeout(
      handler,
      delay + (duration + (cascade ? duration : 0) * count)
    );
    //el.addEventListener('animationend', handler);
    //this.animationEndEl = el;
    //this.animationEndHandler = handler;
  }

  getDimensionValue() {
    return (
      this.el!.offsetHeight! +
      parseInt(window.getComputedStyle(this.el!, null).getPropertyValue('margin-top'), 10) +
      parseInt(window.getComputedStyle(this.el!, null).getPropertyValue('margin-bottom'), 10)
    );
  }
  //    //const delta = this.props.duration>>2,
  //    //      duration = delta,
  //    //      delay = this.props.delay + (this.isOn ? 0 : this.props.duration - delta)

  collapse(state: RevealBaseState, props: RevealBaseProps, inOut: InOut) {
    const total = inOut.duration + (props.cascade ? inOut.duration : 0),
      height = this.isOn ? this.getDimensionValue() : 0;
    let duration, delay;
    if (props.collapseOnly) {
      duration = inOut.duration / 3;
      delay = inOut.delay;
    } else {
      let delta1 = total >> 2,
        delta2 = delta1 >> 1;
      duration = delta1; // + (props.when ? 0 : delta2),
      delay = inOut.delay + (this.isOn ? 0 : total - delta1 - delta2);
      state.style.animationDuration = `${total - delta1 + (this.isOn ? delta2 : -delta2)}ms`;
      state.style.animationDelay = `${inOut.delay + (this.isOn ? delta1 - delta2 : 0)}ms`;
    }
    //const delta = total>>2,
    //      duration = props.when ? delta : total - delta,
    //      delay = inOut.delay + (props.when ? 0 : delta);
    //duration = total;
    //delay = inOut.delay;
    state.collapse = {
      height,
      transition: `height ${duration}ms ease ${delay}ms`, // padding ${duration}ms ease ${delay}ms, border ${duration}ms ease ${delay}ms`,
      overflow: props.collapseOnly ? 'hidden' : undefined,
      //margin: 0, padding: 0, border: '1px solid transparent',
      //boxSizing: 'border-box',
    };
    return state;
  }

  animate(props: RevealBaseProps) {
    if (!this || !this.el) return;
    this.unlisten();
    if (this.isShown === this.isOn) return;
    this.isShown = this.isOn;
    const leaving = !this.isOn && props.outEffect;
    const inOut = props[leaving ? 'outEffect' : 'inEffect'] as InOut;

    //collapse = 'collapse' in props;

    type AN = RevealBaseState['style']['animationName'];
    let animationName: AN = ('style' in inOut && inOut.style.animationName) || void 0;
    let state: RevealBaseState;
    if (!props.collapseOnly) {
      // @ts-ignore TODO remove ts-ignore
      if ((props.outEffect || this.isOn) && inOut.make) animationName = inOut.make;
      //animationName = inOut.make(leaving, props);
      //animationName = (!leaving && this.enterAnimation) || inOut.make(leaving, props);
      state = {
        /* status: leaving ? 'exiting':'entering',*/ hasAppeared: true,
        hasExited: false,
        collapse: undefined,
        style: {
          ...inOut.style,
          animationDuration: `${inOut.duration}ms`,
          animationDelay: `${inOut.delay}ms`,
          animationIterationCount: inOut.forever ? 'infinite' : inOut.count,
          opacity: 1,
          //visibility: 'visible',
          animationName,
        },
        className: inOut.className,
      };
    } else {
      state = { hasAppeared: true, hasExited: false, style: { opacity: 1 } };
    }
    this.setState(props.collapse ? this.collapse(state, props, inOut) : state);
    if (leaving) {
      this.savedChild = React.cloneElement(this.getChild()) as ChildElement;
      this.animationEnd(this.invisible, props.cascade, inOut);
    } else this.savedChild = false;
    //if (collapse)
    //  this.animationEnd( () => this.setState({ collapse: void 0 }), props.cascade, inOut);
    this.onReveal(props);
  }

  onReveal(props: RevealBaseProps) {
    if (props.onReveal && this.isOn) {
      if (this.onRevealTimeout) this.onRevealTimeout = window.clearTimeout(this.onRevealTimeout);
      props.wait
        ? (this.onRevealTimeout = window.setTimeout(props.onReveal, props.wait))
        : props.onReveal();
      //props.wait ? this.onRevealTimeout = window.setTimeout( this.isOn ? (() => props.onReveal(true)):(() => props.onReveal(false)), props.wait) : props.onReveal( this.isOn );
    }
  }

  componentWillUnmount() {
    this.unlisten();
    ssr && disableSsr();
  }

  handleObserve([entry]: IntersectionObserverEntry[], observer: IntersectionObserver) {
    if (entry.intersectionRatio > 0) {
      observer.disconnect();
      this.observer = null;
      this.reveal(this.props, true);
    }
  }

  observe(props: RevealBaseProps, update = false) {
    if (!this.el) return;
    if (observerMode) {
      if (this.observer) {
        if (update) this.observer.disconnect();
        else return;
      } else if (update) return;
      this.observer = new IntersectionObserver(this.handleObserve, { threshold: props.fraction });
      this.observer.observe(this.el);
    }
  }

  reveal(props: RevealBaseProps, inView = false) {
    if (!globalHide) hideAll();
    if (!this || !this.el) return;
    if (!props) props = this.props;
    if (ssr) disableSsr();
    if (this.isOn && this.isShown && props.spy !== undefined) {
      this.isShown = false;
      this.setState({ style: {} });
      window.setTimeout(() => this.reveal(props), 200);
    } else if (inView || this.inViewport(props) || props.force) this.animate(props);
    else observerMode ? this.observe(props) : this.listen();
  }

  componentDidMount() {
    console.log('DID MOUNT');
    if (!this.el || this.props.disabled) return;
    if (!this.props.collapseOnly) {
      if ('make' in this.props.inEffect) this.props.inEffect.make(false, this.props as any); // TODO remove type assertion
      if (this.props.when !== undefined && this.props.outEffect && 'make' in this.props.outEffect)
        this.props.outEffect.make(true, this.props as any); // TODO remove type assertion
    }
    const parentGroup = this.context.transitionGroup;
    const appear =
      parentGroup && !parentGroup.isMounting
        ? !('enter' in this.props && this.props.enter === false)
        : this.props.appear;
    if (
      this.isOn &&
      (((this.props.when !== undefined || this.props.spy !== undefined) && !appear) ||
        (ssr &&
          !fadeOutEnabled &&
          !this.props.ssrFadeout &&
          this.props.outEffect &&
          !this.props.ssrReveal &&
          a.getTop(this.el) < window.pageYOffset + window.innerHeight))
    ) {
      this.isShown = true;
      this.setState({
        hasAppeared: true,
        collapse: this.props.collapse ? { height: this.getDimensionValue() } : this.state.collapse,
        style: { opacity: 1 },
      });
      this.onReveal(this.props);
      return;
    }
    if (
      ssr &&
      (fadeOutEnabled || this.props.ssrFadeout) &&
      this.props.outEffect &&
      a.getTop(this.el) < window.pageYOffset + window.innerHeight
    ) {
      this.setState({ style: { opacity: 0, transition: 'opacity 1000ms 1000ms' } });
      window.setTimeout(() => this.reveal(this.props, true), 2000);
      return;
    }
    if (this.isOn) this.props.force ? this.animate(this.props) : this.reveal(this.props);
    //  return this.animate(this.props);
    //
    //  this.reveal(this.props);
  }

  cascade(children: string | ChildElement) {
    console.log('CASCADE');
    let newChildren;
    if (typeof children === 'string') {
      newChildren = children.split('').map((ch, index) => (
        <span key={index} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
          {ch}
        </span>
      ));
      //reverse = this.props.reverse;
    } else newChildren = React.Children.toArray(children);
    //if (newChildren.length === 1)
    //  return newChildren;
    let { duration, reverse } = this.props[
      this.isOn || !this.props.outEffect ? 'inEffect' : 'outEffect'
    ] as InOut;
    let count = newChildren.length;
    let total = duration * 2;
    //reverse = false;
    if (this.props.collapse) {
      total = parseInt(this.state.style.animationDuration!, 10);
      duration = total / 2;
    }
    let i = reverse ? count : 0;
    //let i = 0;
    newChildren = newChildren.map((child) => {
      if (typeof child === 'object' && child) {
        //&& 'type' in child && typeof child.type === 'string'
        //@ts-ignore TODO remove ts-ignore
        return React.cloneElement(child, {
          style: {
            //@ts-ignore TODO remove ts-ignore
            ...child.props.style,
            ...this.state.style,
            animationDuration:
              Math.round(cascade(reverse ? i-- : i++ /*i++*/, 0, count, duration, total)) + 'ms',
          },
          //ref: i === count? (el => this.finalEl = el) : void 0,
        });
      }
      return child;
    });
    return newChildren;
  }

  static getInitialCollapseStyle(props: RevealBaseProps): Partial<CSSProperties> {
    return {
      height: 0,
      visibility: props.when ? void 0 : 'hidden',
    };
  }

  componentDidUpdate(props: RevealBaseProps) {
    console.log('componentDidUpdate');
    if (props.when !== undefined) this.isOn = !!props.when;
    if (props.fraction !== this.props.fraction) this.observe(props, true);
    if (!this.isOn && props.onExited && 'exit' in props && props.exit === false) {
      props.onExited();
      return;
    }
    if (props.disabled) return;
    if (props.collapse && !this.props.collapse) {
      this.setState({ style: {}, collapse: a.getInitialCollapseStyle(props) });
      this.isShown = false;
    }
    if (props.when !== this.props.when || props.spy !== this.props.spy) this.reveal(props);
    if (this.onRevealTimeout && !this.isOn)
      this.onRevealTimeout = window.clearTimeout(this.onRevealTimeout);
  }

  getChild(): ChildElement {
    if (this.savedChild && !this.props.disabled) return this.savedChild;
    if (typeof this.props.children === 'object') {
      const child = React.Children.only(this.props.children)!;

      if (('type' in child && typeof child.type === 'string') || this.props.refProp !== 'ref') {
        return child as ChildElement;
      } else {
        return (<div>{child}</div>) as ChildElement;
      }
    } else return (<div>{this.props.children}</div>) as ChildElement;
  }

  render() {
    console.log('RENDER');
    let mount;
    if (!this.state.hasAppeared) mount = !this.props.mountOnEnter || this.isOn;
    else mount = !this.props.unmountOnExit || !this.state.hasExited || this.isOn;
    const child = this.getChild();
    //if (this.props.disabled)
    //  return child;

    if (typeof child.ref === 'function') this.childRef = child.ref;
    let newChildren: false | any = false; // TODO add better types
    let { style, className, children } = child.props;
    let newClass = this.props.disabled
        ? className
        : `${this.props.outEffect ? namespace : ''}${
            this.state.className ? ' ' + this.state.className : ''
          }${className ? ' ' + className : ''}` || void 0,
      newStyle;
    if (typeof this.state.style.animationName === 'function')
      // todo: needs refactoring
      this.state.style.animationName = this.state.style.animationName(
        !this.isOn,
        this.props as any // TODO remove type assertion
      );
    if (this.props.cascade && !this.props.disabled && children && this.state.style.animationName) {
      newChildren = this.cascade(children);
      newStyle = { ...style, opacity: 1 };
    } else newStyle = this.props.disabled ? style : { ...style, ...this.state.style };

    const props: Partial<RevealBaseProps> = {
      ...this.props.props,
      className: newClass,
      style: newStyle,
      [this.props.refProp || 'ref']: this.saveRef,
    };

    //if (this.props.collapse && !this.props.disabled)
    //  props.key = 1;
    const el = React.cloneElement(child, props, mount ? newChildren || children : undefined);

    if (this.props.collapse !== undefined) {
      return this.props.collapseEl ? (
        // @ts-ignore TODO remove ts-ignore
        React.cloneElement(this.props.collapseEl, {
          style: {
            ...this.props.collapseEl.style,
            ...(this.props.disabled ? undefined : this.state.collapse),
          },
          children: el,
        })
      ) : (
        <div style={this.props.disabled ? undefined : this.state.collapse} children={el} />
      );
    }
    //return <div {...this.props.collapse} style={ this.props.disabled ? undefined : this.state.collapse } children={el} />;
    return el;
  }

  makeHandler(handler: (props: RevealBaseProps) => void) {
    const update = () => {
      handler.call(this, this.props);
      this.ticking = false;
    };
    return () => {
      if (!this.ticking) {
        raf(update);
        this.ticking = true;
      }
    };
  }

  static getTop(el: any): number {
    while (el.offsetTop === void 0) el = el.parentNode;
    let top = el.offsetTop;
    for (; el.offsetParent; top += el.offsetTop) el = el.offsetParent;
    return top;
  }

  inViewport(props: RevealBaseProps) {
    if (!this.el || window.document.hidden) return false;
    const h = this.el.offsetHeight,
      delta = window.pageYOffset /* - props.margin */ - a.getTop(this.el),
      tail = Math.min(h, window.innerHeight) * (globalHide ? props.fraction! : 0); // TODO remove not null assertion
    return delta > tail - window.innerHeight && delta < h - tail;
  }

  resize(props: RevealBaseProps) {
    if (!this || !this.el || !this.isOn) return;
    if (this.inViewport(props)) {
      this.unlisten();
      this.isShown = this.isOn;
      this.setState({
        hasExited: !this.isOn,
        hasAppeared: true,
        collapse: undefined,
        style: { opacity: this.isOn || !props.outEffect ? 1 : 0 },
      });
      this.onReveal(props);
      //if (this.props.onReveal && this.isOn)
      //  this.props.wait ? this.onRevealTimeout = window.setTimeout(this.props.onReveal, this.props.wait) : this.props.onReveal();
    }
  }

  listen() {
    if (!observerMode && !this.isListener) {
      this.isListener = true;
      const options = { passive: true };
      window.addEventListener('scroll', this.revealHandler!, options);
      window.addEventListener('orientationchange', this.revealHandler!, options);
      window.document.addEventListener('visibilitychange', this.revealHandler!, options);
      window.document.addEventListener('collapseend', this.revealHandler!, options);
      window.addEventListener('resize', this.resizeHandler!, options);
    }
  }

  unlisten() {
    if (!observerMode && this.isListener) {
      const options = { passive: true } as any;
      window.removeEventListener('scroll', this.revealHandler!, options);
      window.removeEventListener('orientationchange', this.revealHandler!, options);
      window.document.removeEventListener('visibilitychange', this.revealHandler!, options);
      window.document.removeEventListener('collapseend', this.revealHandler!, options);
      window.removeEventListener('resize', this.resizeHandler!, options);
      this.isListener = false;
    }
    if (this.onRevealTimeout) this.onRevealTimeout = window.clearTimeout(this.onRevealTimeout);
    if (this.animationEndTimeout)
      this.animationEndTimeout = window.clearTimeout(this.animationEndTimeout);
    //if (this.animationEndHandler)
    //   this.animationEndEl.removeEventListener('animationend', this.animationEndHandler);
  }
}

// RevealBase.propTypes = propTypes;
// RevealBase.defaultProps = defaultProps;
// RevealBase.contextTypes = contextTypes;
// RevealBase.displayName = 'RevealBase';
//RevealBase.childContextTypes = childContextTypes;
export default RevealBase;
