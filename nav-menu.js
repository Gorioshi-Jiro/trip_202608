/**
 * nav-menu.js
 * nav-menu.html を fetch して body 末尾に注入し、
 * 内部の <script> を再実行するローダー。
 * 各HTMLファイルの </body> 直前に <script src="nav-menu.js"></script> を追加するだけで動作。
 */
(function () {
  'use strict';

  function inject(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;

    // <style> を <head> に移動（cloneではなく元要素ごと移動して body への重複を防ぐ）
    Array.from(tmp.querySelectorAll('style')).forEach(function (el) {
      document.head.appendChild(el);
    });

    // <script> のテキストを収集してから要素を除去
    var scriptText = '';
    tmp.querySelectorAll('script').forEach(function (el) {
      scriptText += el.textContent + '\n';
      el.parentNode.removeChild(el);
    });

    // 残りの要素（button / div / nav など）を body 末尾に追加
    while (tmp.firstChild) {
      document.body.appendChild(tmp.firstChild);
    }

    // <script> を新規要素として生成して実行
    if (scriptText.trim()) {
      var execScript = document.createElement('script');
      execScript.textContent = scriptText;
      document.body.appendChild(execScript);
    }
  }

  function load() {
    if (window.fetch) {
      fetch('nav-menu.html')
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(inject)
        .catch(function (e) {
          console.warn('[nav-menu] fetch failed:', e);
        });
    } else {
      // fetch 非対応環境向け XHR フォールバック
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'nav-menu.html', true);
      xhr.onload = function () {
        if (xhr.status < 400) inject(xhr.responseText);
      };
      xhr.onerror = function () {
        console.warn('[nav-menu] XHR failed');
      };
      xhr.send();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
