import {createElementFromHTML, getDebounceFunc} from './utility.js';

// 下拉選單
export class DropdownList extends HTMLElement {

  container = null;
  state = new Proxy(
    // 將預設設定到 target 中 , 預設值
    {
      filterSelector: null,
      show: false,
      data: [],
      maxHeight: '200px',
      isScrollLoading: false, // 如果是 scroll 取資料 , 要用 append 方式追加 Dropdown 的內容
    },
    // handler set 資料後 , 執行 render 函式
    {

      get: (target, property) => target[property],
      set: (target, property, value) => {
        target[property] = value;

        this._render();
        return true;
      },
    })

  position(selector) {

    // 取得目前 element 的位置
    const rect = selector.getBoundingClientRect();
    const tooltipWidth = this.container.getBoundingClientRect().width;

    this.container.style.display = 'inline-flex';
    this.container.style.top = `${rect.top + rect.height + 8}px`;
    this.container.style.left = `${rect.left + (rect.width - tooltipWidth) / 2}px`;
  }

  open(filterSelector) {

    const oldFilterSelector = this.state.filterSelector;
    const newFilterSelector = filterSelector;

    // 將 oldFilterSelector 的 i.arrow 之 rotate 拿掉
    if (oldFilterSelector) oldFilterSelector.querySelector('i.arrow').classList.remove('rotate');

    this.state.filterSelector = newFilterSelector;
    this.state.show = true;

    // 設定 tooltip 的位置
    this.position(newFilterSelector);
  }

  close = () => {

    this.state.filterSelector = null;
    this.state.show = false;
  }

  // 取得單一實例 => 不同的名稱 , 建立不同的 Dropdown , 沒設定名稱 , 就隨機產生一個 uuid 給他
  static getInstance() {

    const currentTooltip = document.querySelector('dropdown-list');

    if (currentTooltip) return currentTooltip;
    else {

      const newTooltip = document.createElement('dropdown-list');
      document.body.append(newTooltip);
      return newTooltip;
    }
  }

  // as Component mounted to page
  constructor() {
    // Always call super first in constructor
    super();

    const div = document.createElement('div');
    div.classList.add('fri-dropdown');
    this.append(div);
    this.container = div;
    this.container.style.display = 'none'
    this._render();
  }

  // 追加單個 item 到 dropdownList 中
  appendItemToListFn = ({dropdown}) => ({text, value}) => {

    const myTooltip = this
    const selector = this.state.filterSelector
    const filterStr = selector.querySelector('input').value
    const selectedValue = selector.state.value

    const li = createElementFromHTML(`<li class='fri-select-dropdown__item' data-value='${value}' data-text='${text}'></li>`)

    // 有篩選到的文字 , 標成紅色
    const textWrap = createElementFromHTML(`<span>${text}</span>`)
    textWrap.innerHTML = text.replace(/\S/g, '<font>$&</font>')
    const children = [...textWrap.children]
    children.forEach(font => {

      const char = font.innerHTML
      if (filterStr.indexOf(char) > -1) font.className = 'text-red font-900'
    })

    li.append(textWrap)
    li.onclick = () => {

      selector.state.value = li.getAttribute('data-value')
      selector.querySelector('input').value = li.getAttribute('data-text')
      myTooltip.close()
    }

    if (value === selectedValue) li.classList.add('selected')
    dropdown.append(li)
  }

  renderDropdownList() {

    console.log('renderDropdownList')

    const div = this.container.querySelector('.fri-select-dropdown__list')
    const selector = this.state.filterSelector
    // this.appendItemToListFn({dropdown})

    if (!this.state.filterSelector) return

    const data = selector.state.json
    const filterStr = selector.querySelector('input').value
    const isRemoteLoading = selector.hasAttribute('remote-loading')

    div.innerHTML = ''

    const filteredData = data.filter((obj) => obj.text.indexOf(filterStr) > -1)

    const appendCreateItem = () => {

      const li = createElementFromHTML(`<li class='fri-select-dropdown__item' data-value='@@新增@@' data-text='新增'><span>新增</span></li>`)
      li.onclick = () => selector.state.mode = 'create'
      div.append(li)
    }

    // 載入中
    if (isRemoteLoading) {

      const li = createElementFromHTML(`
          <li class='fri-select-dropdown__item info loader-item'>
            <i class='loader'></i>
            <span style='margin-left: 5px'>資料載入中...</span>
          </li>
        `)

      div.append(li)

      // 沒有預設選項 : 資料尚未載入
    } else if (data.length === 0) {

      if (selector.hasAttribute('allow-create')) appendCreateItem()
      else div.append(createElementFromHTML(`<li class='fri-select-dropdown__item info'><span>資料尚未載入</span></li>`))

      // 篩選條件沒資料 : 無對應資料
    } else if (filteredData.length === 0) {

      div.append(createElementFromHTML(`<li class='fri-select-dropdown__item info'><span>無對應資料</span></li>`))

      // 有資料
    } else {

      if (selector.hasAttribute('allow-create')) appendCreateItem()

      filteredData.forEach(this.appendItemToListFn({dropdown: div}))

      /*
      const currentPage = parseInt($selector.attr('current-page')) || 1
      const nextPage = currentPage + 1

      // 加上第 n 頁的資料
      const endNum = nextPage * 20
      const pagedFilteredData = (filteredData.length > endNum) ? filteredData.slice(0, endNum) : filteredData

      pagedFilteredData.forEach(this.appendItemToListFn({$selector, $dropdown: $(div)}))
       */
    }

  }

  // 設定下拉選單
  _render() {

    // 目前 dropdownList 對應的 filterSelector
    const selector = this.state.filterSelector;

    /*
    if (!selector) return this.container.innerHTML = `
        <div class='fri-select-dropdown__wrap fri-scrollbar__wrap'>
          <ul class='fri-select-dropdown__list'>
            <li class='fri-select-dropdown__item info loader-item'>
              <i class='loader'></i>
              <span style='margin-left: 5px'>資料載入中...</span>
            </li>
          </ul>
        </div>
    `

    const input = selector.querySelector('input')
    const filterStr = input.value
    const data = this.state.data
    const isRemoteLoading = selector.state.remoteLoading
     */

    // 產生下拉選單
    this.container.innerHTML = `
        <div class='fri-select-dropdown__wrap fri-scrollbar__wrap'>
          <ul class='fri-select-dropdown__list'></ul>
        </div>
    `

    this.renderDropdownList()

    // 將內容建立妥當 , 再設定顯示性 , 較不會出現寬高不正確的狀況
    if (this.state.show) this.container.style.display = 'block'
    else this.container.style.display = 'none'
  }
}


