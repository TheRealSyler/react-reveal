/*
 * React-reveal Global Helpers
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

//import {version} from 'react';

export const namespace = 'react-reveal'; //, is16 = parseInt(version, 10) >= 16;
export const defaults = {
  duration: 1000,
  delay: 0,
  count: 1,
  forever: undefined,
};

/**are we server side rendering */
export let ssr = true;
export let observerMode = false;
/**`window.requestAnimationFrame` shortcut. */
export let raf: (cb: (delta?: number) => void) => void = (cb) => window.setTimeout(cb, 66);
export let disableSsr = () => (ssr = false);
export let fadeOutEnabled = false;
export let ssrFadeout = (enable = false) => (fadeOutEnabled = enable);
export let globalHide = false;
/**internet explorer 10 */
export let ie10 = false;
export let collapseend: Event; // TODO Add better types
let counter = 1;
let effectMap: { [key: string]: string | number } = {};
let sheet: CSSStyleSheet;
let name = `${namespace}-${Math.floor(Math.random() * 1000000000000000)}-`;

export function insertRule(rule: string) {
  try {
    return sheet.insertRule(rule, sheet.cssRules.length);
  } catch (e) {
    console.warn('react-reveal - animation failed');
  }
}

export function cascade(i: number, start: number, end: number, duration: number, total: number) {
  const minv = Math.log(duration),
    maxv = Math.log(total),
    scale = (maxv - minv) / (end - start);
  return Math.exp(minv + scale * (i - start));
}

export function animation(effect: string) {
  if (!sheet) return '';
  const rule = `@keyframes ${name + counter}{${effect}}`;
  const effectId = effectMap[effect];
  if (!effectId) {
    insertRule(rule);
    effectMap[effect] = counter;
    return `${name}${counter++}`;
  }
  return `${name}${effectId}`;
}

export function hideAll() {
  if (globalHide) return;
  globalHide = true;
  window.removeEventListener('scroll', hideAll, true);
  insertRule(`.${namespace} { opacity: 0; }`);
  window.removeEventListener('orientationchange', hideAll, true);
  window.document.removeEventListener('visibilitychange', hideAll);
}

//navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")

if (
  typeof window !== 'undefined' &&
  window.name !== 'nodejs' &&
  window.document &&
  typeof navigator !== 'undefined'
) {
  // are we in browser?
  observerMode =
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window && // bypassing
    'intersectionRatio' in window.IntersectionObserverEntry.prototype && // incomplete implementations
    /\{\s*\[native code\]\s*\}/.test('' + IntersectionObserver); // and buggy polyfills
  raf =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    // @ts-ignore
    window.mozRequestAnimationFrame ||
    raf;
  ssr = window.document.querySelectorAll('div[data-reactroot]').length > 0; // are we pre rendered?
  if (navigator.appVersion.indexOf('MSIE 10') !== -1) ie10 = true;
  //if (ssr && 'serviceWorker' in navigator && navigator.serviceWorker.controller) //cached by service worker?
  //  ssr = false;
  //console.log(Date.now() - window.performance.timing.domLoading<500);
  if (
    ssr &&
    'performance' in window &&
    'timing' in window.performance &&
    'domContentLoadedEventEnd' in window.performance.timing &&
    window.performance.timing.domLoading &&
    Date.now() - window.performance.timing.domLoading < 300
  )
    ssr = false;
  if (ssr) window.setTimeout(disableSsr, 1500);
  if (!observerMode) {
    collapseend = document.createEvent('Event');
    collapseend.initEvent('collapseend', true, true);
  }
  let element = document.createElement('style');
  document.head.appendChild(element);
  if (element.sheet && element.sheet.cssRules && element.sheet.insertRule) {
    sheet = element.sheet;
    window.addEventListener('scroll', hideAll, true);
    window.addEventListener('orientationchange', hideAll, true);
    window.document.addEventListener('visibilitychange', hideAll);
  }
}

export default function config({ ssrFadeout }: { ssrFadeout: boolean }) {
  fadeOutEnabled = ssrFadeout;
}
