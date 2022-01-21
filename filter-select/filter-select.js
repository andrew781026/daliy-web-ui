import {wait, copyAttrToInput} from './utility.js';
import {DropdownList} from './dropdown-list.js';

class FilterSelect extends HTMLElement {

  container = null;  // the root container
  tooltip = null;
  state = new Proxy(
    // 將預設設定到 target 中 , 預設值
    {
      showClose: false,
      mode: 'view', // data-mode 有 edit . view . create
      value: '',
      json: [],
    },
    // handler set 資料後 , 執行 render 函式
    {

      get: (target, property) => target[property],
      set: (target, property, value) => {

        target[property] = value;
        if (property === 'open') this.tooltipCtrl(value);
        else if (property === 'showClose') this.closeCtrl(value);
        else this._render();
        return true
      },
    })

  static initRootContainer = (selector) => {

    const div = document.createElement('div');
    div.classList.add('filter-select');
    selector.container = div;
    selector.append(div);
    selector.state.value = selector.getAttribute('data-value');
    selector.state.json = JSON.parse(selector.getAttribute('data-json')) || [];
  }

  // as Component mounted to page
  constructor() {

    // Always call super first in constructor
    super();

    // 建立一個下拉選單
    this.tooltip = DropdownList.getInstance();

    // 設定根 container
    FilterSelect.initRootContainer(this);
    this._render();
    this.setEvents();
  }

  // 設定相關 event listener
  setEvents() {

    // 註冊 filterSelect 的捲動處理
    this.on('loading-start', () => {

      const query = this.querySelector('input').value;
      this.loadingMethod(query)
        .then(result => this.trigger('loading-end', result))
        .catch(err => {
          console.error('[loading] selector = ', this, 'in filterSelect.loadingMethod happen Error !! \n', err)
        })
    })

    // mouseenter - 有值時 , arrow-icon 變成 close-icon
    this.container.addEventListener('mouseenter', e => {

      // console.log('mouseenter');
      this.state.showClose = Boolean(this.computed.dataText());

    }, false);

    // mouseleave - close-icon 變成 arrow-icon
    this.container.addEventListener('mouseleave', e => {

      //   mouseleave - 遇到子元素會觸發 / mouseout - 遇到子元素不會觸發

      // console.log('mouseleave');
      this.state.showClose = false;

    }, false);

    // selector 點擊的時候 , 控制 DropdownList 的顯示性
    this.container.addEventListener('click', e => {

      /*
        - target is the element that triggered the event (e.g., the user clicked on) 發生地
        - currentTarget is the element that the event listener is attached to. 事件實際處理的地方
       */

      const isCloseIcon = e.target.matches('i.close');
      const isInput = e.target.matches('input');

      // 目前 click 事件作用在 this.container 上面
      if (isInput) {

        const tooltipTarget = this.tooltip.state.filterSelector;

        if (this.state.mode === 'create') this.state.open = false;
        else if (tooltipTarget === this) this.state.open = false;
        else this.state.open = true;
      }

      // 目前 click 事件作用在 i.close 上面
      else if (isCloseIcon) {

        // 點擊 close , 清空 value 值
        this.state.value = '';
      }

    }, true);  // 第三個參數 useCapture = true , 代表子元素的 bubble event 也處理

    // selector 點擊的時候 , 控制 DropdownList 的顯示性
    this.container.addEventListener('keyup', e => {

      /*
        - target is the element that triggered the event (e.g., the user clicked on) 發生地
        - currentTarget is the element that the event listener is attached to. 事件實際處理的地方
       */

      const isInput = e.target.matches('input');

      // 目前 click 事件作用在 this.container 上面
      if (isInput) {

        const myTooltip = this.tooltip;
        myTooltip.renderDropdownList()
      }

    }, true);  // 第三個參數 useCapture = true , 代表子元素的 bubble event 也處理
  }

  // Object.getOwnPropertyNames( HTMLElement ) => 取得物件上設定的 function & property
  listFn = () => Object.getOwnPropertyNames(this)

  // 需要設定 , 選擇某個項目後 , 會執行的事情
  selectItem = ({value} = {}) => {

    if (!value) {
      return console.warn('param { value } is required 😫')
    }

    const $selector = $(filterSelect)
    const dataText = getDataText($selector, value)
    if (dataText) {
      $selector.attr('data-value', value)
      $selector.attr('data-mode', 'view')
      myTooltip.close()

    } else return console.warn(`[ value = ${value} ] is not in data-json 😥`)
  }

  // 設定 eventEmitter
  emitters = {}
  on = (eventName, listener) => this.emitters[eventName] = listener
  trigger = (eventName, ...params) => this.emitters[eventName].call(this, this, params[0])

  loadingMethod = async query => await wait(1000);
  remoteMethod = async query => await wait(1000);


  bindFilterSelectEvents(filterSelect) {

    const observer = new MutationObserver(dropdownListMutation)
    observer.observe(filterSelect, {
      attributes: true,
      attributeOldValue: true,
    })

    // 避免 focus 時 , 再次點擊讓 tooltip 關閉
    $(filterSelect).on('click', 'input', function (e) {

      const isFocus = (this === document.activeElement)
      const isEditMode = (filterSelect.getAttribute('data-mode') === 'edit')
      if (isFocus && isEditMode) {

        e.preventDefault()
        e.stopPropagation()
      }
    })

    $(filterSelect).on('keyup', 'input', function (e) {

      const $selector = $(this).parent()

      if ($selector.attr('data-mode') === 'create') {

        $selector.attr('data-value', $(this).val())

      } else {

        // 觸發 remote-loading
        if ($selector.is('[can-remote]')) {

          $selector.attr('remote-loading', 'remote-loading')

          getDebounceFunc('filter-select-remote-fetch', 500)(() => {

            const query = $(filterSelect).find('input').val()

            filterSelect.remoteMethod(query)
              .then(result => {

                $selector.removeAttr('remote-loading')

                if (result) {

                  const dataJson = (typeof result === 'string') ? result : JSON.stringify(result)
                  $selector.attr('data-json', dataJson)
                }
              })
              .catch(err => {
                $selector.removeAttr('remote-loading')
                console.error('[remote] selector = ', filterSelect, 'in filterSelect.remoteMethod happen Error !! \n', err)
              })

          })
        }

        const dropdownList = myTooltip.content[0].querySelector('.fri-select-dropdown__list')
        renderDropdownList($(dropdownList), $selector.get(0))
      }
    })

    // i.close - 清除資料...
    $(filterSelect).on('click', 'i.close', function (e) {
      e.stopPropagation()  // 停止將 click event 向外傳出
      const $selector = $(this).parent()

      // 如果是 create mode 需要將上一次的資料 , 帶回來
      const isCreateMode = (filterSelect.getAttribute('data-mode') === 'create')
      const preDataValue = $selector.attr('preDataValue')

      if (isCreateMode) $selector.attr('data-value', preDataValue).attr('data-mode', 'view')
      else $selector.attr('data-mode', 'nodata')
    })
  }

  getDataText = (selector, value) => {

    const jsonData = JSON.parse(selector.getAttribute('data-json') || '[]');
    const dataValue = value || selector.getAttribute('data-value');
    const dataTextObj = jsonData.find(item => dataValue === item.value);
    return dataTextObj ? dataTextObj.text : '';
  }

  tooltipCtrl(open) {

    const arrowIcon = this.container.querySelector('i.arrow');

    if (open) {
      this.tooltip.open(this);
      arrowIcon.classList.add('rotate');
    } else {
      this.tooltip.close();
      arrowIcon.classList.remove('rotate');
    }
  }

  closeCtrl = (showClose) => {

    const arrowIcon = this.container.querySelector('i.arrow')
    const closeIcon = this.container.querySelector('i.close')

    if (showClose) {
      arrowIcon.style.display = 'none';
      closeIcon.style.display = 'inline';
    } else {
      arrowIcon.style.display = 'inline';
      closeIcon.style.display = 'none';
    }
  }

  computed = {

    placeholder: () => (this.state.mode === 'edit') ? this.state.placeholder : this.getAttribute('placeholder'),
    dataText: () => this.getDataText(this),
  }


  // 需要計算出 placeholder

  // 需要計算出 dataText

  // 每次 this.state.mode 改變時 , 都需要重新 render 一次
  _render() {

    // get element attrs

    /** TODO 以下為待辦事項 -
     * ✔ ✖ 口
     * ✔ 1. parent 的 attr 要 copy 下來 , 除了 id , data-json , data-value
     * 口 3. setSelectorInputText($selector[0])
     * 口 4. if ($selector.is('[disabled]')) myTooltip.detach($selector) - disabled 後就不會有反應
     * 口 5. if ($selector[0].afterInit) $selector[0].afterInit.call($selector[0])  // 呼叫註冊的 afterInit
     * 口 6. 避免 enter 時 , 觸發 button click => $input.on('keypress', e => (e.keyCode === 13) ? e.returnValue = false : '')
     */

    // 不同的情況顯示不同的 UI 呈現

    // A. create mode
    if (this.state.mode === 'create') {

      this.container.innerHTML = `
        <input type='text' autocomplete='off'>
        <i class='close'></i>
        <i class='corner'></i>
      `

      return copyAttrToInput(this, this.container.querySelector('input'))
    }

    // B. view mode
    else if (this.state.mode === 'view') {

      this.container.innerHTML = `
        <input type='text' autocomplete='off'>
        <i class='close' style="display: none"></i>
        <i class='arrow'></i>
      `

      return copyAttrToInput(this, this.container.querySelector('input'))
    }


    this.container.innerHTML = `
      <input type='text' autocomplete='off'>
      <i class='close'></i>
      <i class='arrow'></i>
    `

  }

}

window.customElements.define('filter-select', FilterSelect);
window.customElements.define('dropdown-list', DropdownList);
