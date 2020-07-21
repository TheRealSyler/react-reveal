/*
 * Step Auxiliary Class
 *
 * Copyright © Roman Nosov 2017
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

interface Api {
  step: number;
  start: (step: number) => void;
  isShown: boolean;
  animate: (prop: any) => void;
  inViewport: () => void;
  props: any; // TODO add correct type.
}

class Step {
  chain: Api[] = [];
  start?: (step: number) => void;
  index: number = -Infinity; // TODO figure out if assigning -Infinity is a problem.
  constructor(public name: string, public after = 1000) {
    this.after = after;
    this.name = name;
  }

  push(api: Api) {
    if (this.start) {
      api.step = this.index;
      api.start = this.start;
    }
    this.chain.push(api);
  }
}

export default Step;
