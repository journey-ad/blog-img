!(function () {
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

#pv-metadata-container {
  position: absolute;
  right: 10px;
  bottom: 58px;
  width: min(500px, 80vw);
  color: #c0c2c4;
  background: rgba(75, 76, 82, 0.8);
  backdrop-filter: blur(6px);
  padding: 18px 20px;
  border-radius: 12px;
}

#pv-metadata-container fieldset {
  margin-bottom: 12px;
  padding: 0;
  border: none;
  text-align: left;
}

#pv-metadata-container fieldset legend {
  position: relative;
  top: -4px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  font-weight: 500;
  margin-right: auto;
}

#pv-metadata-container fieldset textarea {
  font-family: monospace;
  line-height: 1.1;
  width: calc(100% - 22px);
  height: 10em;
  padding: 8px 10px;
  color: #d5dadd;
  border-radius: 4px;
  background: rgba(44, 46, 50, 0.6);
  border: none;
  appearance: none;
  resize: none;
}

#pv-metadata-container fieldset textarea.negative {
  height: 3.4em;
}

#pv-metadata-container fieldset textarea::-webkit-scrollbar {
  width: 0;
}

#pv-metadata-container .meta-params {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(30%, 1fr));
  gap: 8px 14px;
}

#pv-metadata-container .params__item {
  display: inline-flex;
  font-size: 14px;
  font-weight: 500;
}

#pv-metadata-container .params__item input {
  font-size: 12px;
  margin-left: 0.8em;
  width: 100%;
  padding: 4px 8px;
  text-align: right;
  appearance: none;
  border: none;
  border-radius: 5px;
  color: #d5dadd;
  background: rgba(44, 46, 50, 0.6);
}

#pv-metadata-container .copy {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0 8px;
  width: 100%;
  padding: 14px;
  margin-top: 14px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: bold;
  color: #a2d9ff;
  background: #213549;
  cursor: pointer;
  transition: filter .18s ease-in-out;
}

#pv-metadata-container .copy:hover {
  filter: brightness(1.15);
}

#pv-metadata-container .copy svg {
  width: 1em;
  height: 1em;
}
`;

  // 库文件
  const libs = [
    'https://unpkg.com/exifreader@4.12.0/dist/exif-reader.js', // exif 读取
    'https://unpkg.com/clipboard@2.0.11/dist/clipboard.min.js', // 剪贴板
  ]

  async function init() {
    addCss(css);
    await Promise.all(libs.map((url) => loadScript(url))) // 加载库文件

    const isMobile = /Mobile|Android|iPhone|iPod|iPad/.test(navigator.userAgent);

    // 监听预览弹窗显示隐藏
    const observer = new MutationObserver((mutation) => {
      const isPreview = !mutation[0].target.classList.contains('hidden'); // 预览弹窗是否显示

      if (isPreview) {
        // 预览弹窗显示时 获取图片元数据
        debunce(() => {
          const $img = document.querySelector('#pv-content-img')
          $img && getImgMetadata($img, !isMobile);
        }, 200)();
      } else {
        // 否则移除元数据容器
        document.querySelector('#pv-bar-meta')?.remove();
        document.querySelector('#pv-metadata-container')?.remove();
      }
    })
    // 监听预览弹窗class变化
    observer.observe(document.querySelector('#pv-overlay'), { attributes: true })

    // 处理信息按钮点击
    delegateEvent(document, 'click', '#pv-bar-meta', () => {
      const $metaConEL = document.querySelector('#pv-metadata-container')

      if ($metaConEL) {
        $metaConEL.remove()
        return
      }

      getImgMetadata(document.querySelector('#pv-content-img'))
    });

    // 允许元数据弹窗选中文字
    delegateEvent(document, 'mousedown mousemove keydown keypress', '#pv-metadata-container textarea, #pv-metadata-container input', (e) => {
      e.stopPropagation();
      e.returnValue = true;
    }, true);

    // 处理复制按钮点击
    new ClipboardJS('#pv-metadata-container .copy', {
      text: (trigger) => trigger._metadata,
    });
  }

  // 添加元数据容器
  function addMetadataContainer({ prompt, negative, params, data }) {
    const $container = document.querySelector('#pv-metadata-container'); // 元数据容器

    if ($container) {
      $container.remove();
    }

    const $bottombar = document.querySelector('#pv-bottombar'); // 底部工具栏
    const $metaContainer = `
<div id="pv-metadata-container">
  <fieldset>
    <legend>Prompt</legend>
    <textarea class="prompt" readonly>${prompt}</textarea>
  </fieldset>
  <fieldset>
    <legend>Negative prompt</legend>
    <textarea class="negative" readonly>${negative}</textarea>
  </fieldset>
  <div class="meta-params">
    ${Object.entries(params).map(([key, value]) => `
    <div class="params__item" title="${key}: ${value}">
      ${key} <input type="text" value="${value}" readonly></input>
    </div>`).join('')}
  </div>
  <button class="copy">
    <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M878.25 981.333H375.34a104.661 104.661 0 0 1-104.662-104.661V375.339A104.661 104.661 0 0 1 375.34 270.677H878.25A104.661 104.661 0 0 1 982.912 375.34V878.25c-1.579 56.234-48.427 103.082-104.661 103.082zM375.34 364.373a10.667 10.667 0 0 0-10.923 10.966V878.25c0 6.229 4.693 10.922 10.923 10.922H878.25a10.667 10.667 0 0 0 10.922-10.922V375.339a10.667 10.667 0 0 0-10.922-10.923H375.339z" fill="currentColor"/><path d="M192.597 753.323h-45.269A104.661 104.661 0 0 1 42.667 648.66V147.328A104.661 104.661 0 0 1 147.328 42.667H650.24a104.661 104.661 0 0 1 104.619 104.661v49.963c0 26.538-20.31 46.848-46.848 46.848a46.037 46.037 0 0 1-46.848-46.848v-49.963a10.667 10.667 0 0 0-10.923-10.965H147.328a10.667 10.667 0 0 0-10.965 10.965V650.24c0 6.23 4.693 10.923 10.965 10.923h45.27c26.538 0 46.847 20.309 46.847 46.848 0 26.538-21.845 45.312-46.848 45.312z" fill="currentColor"/></svg>
    Copy Generation Data
  </button>
</div>`;

    $bottombar.insertAdjacentHTML('beforeend', $metaContainer); // 插入元数据容器

    document.querySelector('#pv-metadata-container .copy')._metadata = data; // 复制按钮添加元数据
  }

  const regex_prompt = /^(?<prompt>.*)Negative prompt: (?<negative>.*)$/s; // 提取提示信息正则
  function getImgMetadata(img, showPop=true) {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', img.src, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function (e) {
      const buffer = xhr.response;
      const tags = ExifReader.load(buffer);

      const { description, value } = tags['parameters'] || {}; // get sd webui exif data

      const data = description || value;

      if (data) {
        const dataArr = data.split('\n')
        // 提取参数 和 提示信息
        const paramsStr = dataArr.pop(), promptStr = dataArr.join('\n');

        const { groups: { prompt, negative } } = regex_prompt.exec(promptStr) || {};

        const paramsArr = [...paramsStr.matchAll(/([a-zA-Z]+): ([\w\d.\[\]\s-]+)/g)]
        const params = Object.fromEntries(paramsArr.map(([_, key, value]) => [key, value]))


        showPop && addMetadataContainer({ prompt, negative, params, data }) // 添加元数据展示弹窗
        addInfoBtns(); // 添加查看按钮
      }
    };

    xhr.send(null);
  }

  function addInfoBtns() {
    if (document.querySelector('#pv-bar-meta')) return;

    const $btnEL = document.querySelector('#pv-bar-raw');

    const $metaBtn = `
<li id="pv-bar-meta" class="bar-right bar-button">
  <img src="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01MTIgOTcuNTI0YzIyOC45MTMgMCA0MTQuNDc2IDE4NS41NjMgNDE0LjQ3NiA0MTQuNDc2Uzc0MC45MTMgOTI2LjQ3NiA1MTIgOTI2LjQ3NiA5Ny41MjQgNzQwLjkxMyA5Ny41MjQgNTEyIDI4My4wODcgOTcuNTI0IDUxMiA5Ny41MjR6bTAgNzMuMTQzYy0xODguNTE0IDAtMzQxLjMzMyAxNTIuODItMzQxLjMzMyAzNDEuMzMzUzMyMy40ODcgODUzLjMzMyA1MTIgODUzLjMzMyA4NTMuMzMzIDcwMC41MTMgODUzLjMzMyA1MTIgNzAwLjUxMyAxNzAuNjY3IDUxMiAxNzAuNjY3em0zNi41NzEgMjY4LjE5VjczMS40M0g0NzUuNDNWNDM4Ljg1N2g3My4xNDJ6bTAtMTIxLjkwNXY3My4xNDNINDc1LjQzdi03My4xNDNoNzMuMTQyeiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==">
</li>`

    $btnEL.insertAdjacentHTML('afterend', $metaBtn);
  }

  function delegateEvent(parent, eventType, selector, handler, useCapture) {
    eventType = eventType.split(' ')
    eventType.forEach(eventName => {
      parent.addEventListener(eventName, function (event) {
        var target = event.target;
        while (target !== parent) {
          if (target.matches(selector)) {
            handler.call(target, event);
          }
          target = target.parentNode;
        }
      }, useCapture);
    })
  }

  function debunce(fn, wait, immediate) {
    let timeout;

    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) fn.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) fn.apply(context, args);
    };
  }

  function addCss(css) {
    const style = document.createElement('style');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));

    document.head.appendChild(style);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.src = src;
      script.async = true;
      script.defer = true;

      script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
          console.log(src);
          script.onload = script.onreadystatechange = null;
          resolve();
        }
      };

      script.onerror = (e) => reject(e);

      document.body.appendChild(script);
    });
  }

  // 初始化
  window.addEventListener('load', init, false);
}());
