
// 參考來源 =Summer。桑莫。夏天= : https://cythilya.github.io/2017/03/12/uuid/
export function _uuid() {
  var d = Date.now();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function getAttributes(el) {

  const attrs = el.attributes;
  return Object.values(attrs).reduce((prev, curr) => {

    prev[curr.name] = curr.value
    return prev;
  }, {});
}

export function setAttributes(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
}

// wait ms milliseconds
export const wait = ms => new Promise(r => setTimeout(r, ms));

// 需要控制 top . left 的位置
export const getPosition = (e, tooltip) => {

  const viewHeight = window.innerWidth || 0
  const viewWidth = window.innerHeight || 0
  const currentX = e.clientX || 0
  const currentY = e.clientY || 0

  return {
    left: (viewWidth > currentX + 500) ? currentX : currentX - tooltip.offsetWidth,
    top: (viewHeight > currentY + 500) ? currentY : currentY - tooltip.offsetHeight,
  }
}

export const copyAttrToInput = (selector, inputEl) => {

  // 取得 <filter-select /> 上面的 attr
  const attrs = getAttributes(selector);
  const {id, dataJson, dataValue, ...otherAttrs} = attrs;

  // 將 attr copy 到 input 上面
  setAttributes(inputEl, {...otherAttrs, value: selector.computed.dataText()});

  return selector;
}

export function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild;
}

// 收集已設定的 debounce
const debounceMap = {}

function debounce(func, delay) {
  var timer = null
  return function() {
    var context = this
    var args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(context, args), delay)
  }
}

/**
 * 產生延遲一秒效果的 function
 * <br>
 * 參考資料 :
 *  <a href='https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html'>
 *    https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html
 *  </a>
 * <br>
 * 使用範例 : getDebounceFunc('name', waitSec)(fn);
 * @param debounceId
 * @param wait
 * @return {(function(): void)|*}
 */
export const getDebounceFunc = (debounceId, wait = 1000) => {

  const tempFunc = debounceMap[`${debounceId}`]

  if (tempFunc) return tempFunc
  else {

    const newTempFunc = debounce(func => func(), wait)
    debounceMap[`${debounceId}`] = newTempFunc
    return newTempFunc
  }
}

function throttle(func, threshhold = 250) {
  var last, timer
  return function() {
    var context = this
    var args = arguments
    var now = +new Date()
    if (last && now < last + threshhold) {
      clearTimeout(timer)
      timer = setTimeout(function() {
        last = now
        func.apply(context, args)
      }, threshhold)
    } else {
      last = now
      func.apply(context, args)
    }
  }
}

// 收集已設定的 throttle
const throttleMap = {}

/**
 * 產生每一秒呼叫一次的 function
 * <br>
 * 參考資料 :
 *  <a href='https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html'>
 *    https://mropengate.blogspot.com/2017/12/dom-debounce-throttle.html
 *  </a>
 * <br>
 * 使用範例 : getThrottleFunc('name', waitSec)(fn);
 * @param throttleId
 * @param wait
 * @return {(function(): void)|*}
 */
export const getThrottleFunc = (throttleId, wait = 1000) => {

  const tempFunc = throttleMap[`${throttleId}`]

  if (tempFunc) return tempFunc
  else {

    const newTempFunc = throttle(func => func(), wait)
    throttleMap[`${throttleId}`] = newTempFunc
    return newTempFunc
  }
}
