//// credit: http://www.javascriptkit.com/javatutors/touchevents2.shtml
// var supportsPassive = false;
//    try {
//      var opts = Object.defineProperty({}, 'passive', {
//        get: function() {
//          supportsPassive = true;
//        }
//      });
//      window.addEventListener("testPassive", null, opts);
//      window.removeEventListener("testPassive", null, opts);
//    } catch (e) {}

export type Direction = 'none' | 'left' | 'right' | 'up' | 'down';

export default function swipeDetect(el: HTMLElement, callback?: (swipe: Direction) => void) {
  const touchSurface = el;
  let swipe: Direction;
  let startX: number;
  let startY: number;
  let distX;
  let distY;
  let threshold = 150; //required min distance traveled to be considered swipe
  let restraint = 100; // maximum distance allowed at the same time in perpendicular direction
  let allowedTime = 300; // maximum time allowed to travel that distance
  let elapsedTime;
  let startTime: number;
  const handleSwipe = callback || function (swipe: Direction) {};

  // Use our detects results. passive applied if supported, capture will be false either way.
  //elem.addEventListener('touchstart', fn, supportsPassive ? { passive: true } : false);

  touchSurface.addEventListener(
    'touchstart',
    (e) => {
      const touchObj = e.changedTouches[0];
      swipe = 'none';
      //dist = 0;
      startX = touchObj.pageX;
      startY = touchObj.pageY;
      startTime = new Date().getTime(); // record time when finger first makes contact with surface
      //e.preventDefault();
    },
    { passive: true }
  ); //supportsPassive ? { passive: true } : false)

  //touchSurface.addEventListener('touchmove', function(e){
  //    e.preventDefault() // prevent scrolling when inside DIV
  //}, false)

  touchSurface.addEventListener(
    'touchend',
    (e) => {
      const touchObj = e.changedTouches[0];
      distX = touchObj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
      distY = touchObj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
      elapsedTime = new Date().getTime() - startTime; // get time elapsed
      if (elapsedTime <= allowedTime) {
        // first condition for awipe met
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          // 2nd condition for horizontal swipe met
          swipe = distX < 0 ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
        } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
          // 2nd condition for vertical swipe met
          swipe = distY < 0 ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
        }
      }
      handleSwipe(swipe);
      //e.preventDefault()
    },
    { passive: true }
  ); //supportsPassive ? { passive: true } : false)
}
