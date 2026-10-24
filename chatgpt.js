(function () {
  'use strict';

  let gCount = 0;
  let keyDownTimer = null;

  const keyActions = {
    j: (e) => scroll(e, 100),
    k: (e) => scroll(e, -100),
    g: (e) => scrollToTop(e),
    'shift+g': (e) => scrollToBottom(e),
    i: (e) => changeToInsertMode(e),
    s: (e) => changeToInsertMode(e),
    'ctrl+d': (e) => scroll(e, 500),
    'ctrl+u': (e) => scroll(e, -500),
    'ctrl+w': () => {}, // 画面を閉じないため
    'ctrl+r': () => location.reload(),
    F12: 'passthrough', // DevTools を開くため,
  };

  const attachEvent = (e) => {
    const placeholder = e.srcElement.placeholder;
    if (placeholder != null && placeholder.indexOf('検索') >= 0) {
      return;
    }

    if (e.target.getAttribute('aria-label') == 'ChatGPT に聞く') {
      editAction(e);
    } else {
      normalAction(e);
    }
  };

  const editAction = (e) => {
    if (e.isComposing) {
      return;
    }

    if (e.key == 'Escape') {
      e.target.blur();
      return;
    }

    if (e.ctrlKey && e.key == 'm') {
      console.log('M Enter');
      dispatchEvent(e, 'Enter');
      return;
    }

    if (e.key != 'Enter' && e.key != ']') {
      return;
    }

    if (e.shiftKey) {
      return;
    }

    if (!e.ctrlKey) {
      dispatchEvent(e, 'Enter');
      return;
    }

    const ele = document.querySelector("div.contents button[type='submit']");
    if (ele != null) {
      ele.click();
      setTimeout(() => {
        e.target.innerHTML = '';
      }, 50);
      setTimeout(() => ele.blur(), 500);
    }

    setTimeout(() => e.target.blur(), 200);
  };

  const normalAction = (e) => {
    const id = getKeyId(e);
    const action = keyActions[id];

    if (!action) {
      return;
    }

    if (action === 'passthrough') {
      return;
    }

    e.stopImmediatePropagation();
    e.preventDefault();
    action(e);
  };

  const scroll = (e, value) => {
    const container = getScrollContainer();
    if (container) {
      container.scrollTop += value;
    }
  };

  const scrollToTop = (e) => {
    // Vim-like: "gg" to go to top
    gCount += 1;

    if (gCount === 2) {
      gCount = 0;
      clearTimeout(keyDownTimer);
      const container = getScrollContainer();
      if (container) {
        container.scrollTop = -container.scrollHeight;
      } else if (document.scrollingElement) {
        document.scrollingElement.scrollTop = 0;
      } else {
        globalThis.scrollTo({ top: 0, behavior: 'instant' });
      }
      return;
    }

    clearTimeout(keyDownTimer);
    // 許容時間をやや長めにして実運用で反応しやすくする
    keyDownTimer = setTimeout(() => {
      gCount = 0;
    }, 800);
  };

  const getKeyId = (e) => {
    const isChar = typeof e.key === 'string' && e.key.length === 1;
    const base = isChar ? e.key.toLowerCase() : e.key;

    const mods = [];
    if (e.ctrlKey) mods.push('ctrl');
    if (e.altKey) mods.push('alt');
    if (e.shiftKey) mods.push('shift');
    if (e.metaKey) mods.push('meta');

    return mods.length ? `${mods.join('+')}+${base}` : base;
  };

  const scrollToBottom = (e) => {
    const container = getScrollContainer();
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };
  const getTextArea = () => {
    // ラベル名に依存せず、入力欄と contenteditable 属性を持つ要素を文書順に集める。
    const inputElements = Array.from(
      document.querySelectorAll('input,textarea,*[contenteditable]')
    ).filter((ele) => {
      // ボタンやチェックボックスなどを候補から除外する。
      const isEditable =
        ele.localName === 'textarea' ||
        ele.hasAttribute('contenteditable') ||
        (ele.localName === 'input' &&
          ![
            'button',
            'checkbox',
            'color',
            'file',
            'hidden',
            'image',
            'radio',
            'reset',
            'submit',
            'week',
          ].includes(ele.getAttribute('type')));

      // レイアウト上の非表示要素や無効な要素、chromium-vim 入力欄を除外する。
      // offsetParent は通常、display: none の要素では null になる（固定配置などでも null になり得る）。
      return (
        isEditable &&
        ele.offsetParent &&
        !ele.disabled &&
        ele.getAttribute('type') !== 'hidden' &&
        getComputedStyle(ele).visibility !== 'hidden' &&
        ele.getAttribute('display') !== 'none' &&
        ele.id !== 'cVim-command-bar-input'
      );
    });

    // 画面と少しでも重なる最初の候補を優先する。座標は表示領域の左上が基準。
    // 画面内に候補がなければ文書順の先頭、候補自体がなければ null を返す。
    return (
      inputElements.find((ele) => {
        const rect = ele.getBoundingClientRect();
        return (
          rect.top + rect.height >= 0 &&
          rect.left + rect.width >= 0 &&
          rect.right - rect.width <= globalThis.innerWidth &&
          rect.top < globalThis.innerHeight
        );
      }) ??
      inputElements[0] ??
      null
    );
  };

  const changeToInsertMode = (e) => {
    const ele = getTextArea();
    // 入力欄がまだ生成されていない場合などは、フォーカスせずに終了する。
    if (!ele) {
      return;
    }
    ele.focus();
    // 実際にフォーカスされた要素が select() に対応していれば、内容を選択する。
    if (document.activeElement.select) {
      document.activeElement.select();
    }
    // 読み取り専用でなければ、選択を解除して現在行の右端へカーソルを移す。
    if (!document.activeElement.hasAttribute('readonly')) {
      document.getSelection()?.modify('move', 'right', 'lineboundary');
    }
  };

  const dispatchEvent = (e, key) => {
    e.preventDefault();

    let newEvent = new KeyboardEvent('keydown', {
      key: key,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    e.target.dispatchEvent(newEvent);
  };

  const getSafeQuerySelector = (el) => {
    if (el.id) {
      return `#${CSS.escape(el.id)}`;
    }

    const parts = [];
    while (el && el.nodeType === 1 && el !== document.documentElement) {
      const parent = el.parentElement;
      if (!parent) break;

      const index = Array.from(parent.children).indexOf(el) + 1;
      parts.unshift(`${el.tagName.toLowerCase()}:nth-child(${index})`);
      el = parent;
    }

    return parts.join(' > ');
  };

  const getScrollContainer = () => {
    /*
        const timeline = document.querySelector("[data-app-action-timeline-scroll]");
        if (timeline) {
            console.log("timeline")
            return timeline;
        }
*/
    const pane =
      Array.from(document.querySelectorAll('main, main *'))
        .filter((element) => {
          const overflowY = getComputedStyle(element).overflowY;
          return (
            element.scrollHeight > element.clientHeight &&
            (overflowY === 'auto' || overflowY === 'scroll')
          );
        })
        .sort(
          (a, b) =>
            b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight)
        )[0] ?? null;

    if (pane != null) {
      return pane;
    }

    console.log('pane is null');

    const first = Array.from(document.querySelectorAll('*')).find(
      (e) => e.scrollTop !== 0
    );

    if (first == null) {
      console.log('first is null');
    }
    return first;
  };

  globalThis.addEventListener('keydown', attachEvent, { capture: true });

  let initialized = false;

  let iniFunc = () => {
    if (initialized) {
      return;
    }

    let textEle = getTextArea();
    if (textEle == null) {
      setTimeout(() => iniFunc(), 500);
      return;
    }

    if (location.href.includes('prompt=') || location.href.includes('q=')) {
      if (textEle.innerText == '') {
        setTimeout(() => iniFunc(), 500);
        return;
      }
      document.querySelector('#composer-submit-button').click();
    }

    document.activeElement.blur();
    initialized = true;
  };

  setTimeout(() => iniFunc(), 500);
})();
