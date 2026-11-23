/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：前端公共请求工具 —— 统一 fetch、统一控制台输出（console.log / console.error）
 */
(function Cheney_global() {
  const Cheney_API_BASE = '/api';

  /**
   * 发起接口请求
   * @param {string} Cheney_path 形如 '/news'
   * @param {object} Cheney_options { method, body, query }
   * @returns {Promise<{ok:boolean,status:number,body:any,url:string}>}
   */
  async function Cheney_request(Cheney_path, Cheney_options = {}) {
    const Cheney_method = (Cheney_options.method || 'GET').toUpperCase();
    let Cheney_url = `${Cheney_API_BASE}${Cheney_path}`;

    if (Cheney_options.query) {
      const Cheney_search = new URLSearchParams();
      Object.entries(Cheney_options.query).forEach(([Cheney_k, Cheney_v]) => {
        if (Cheney_v !== undefined && Cheney_v !== null && Cheney_v !== '') {
          Cheney_search.append(Cheney_k, Cheney_v);
        }
      });
      const Cheney_qs = Cheney_search.toString();
      if (Cheney_qs) Cheney_url += `?${Cheney_qs}`;
    }

    const Cheney_fetchOptions = { method: Cheney_method, headers: {} };
    if (Cheney_options.body !== undefined) {
      if (typeof FormData !== 'undefined' && Cheney_options.body instanceof FormData) {
        Cheney_fetchOptions.body = Cheney_options.body;
      } else {
        Cheney_fetchOptions.headers['Content-Type'] = 'application/json';
        Cheney_fetchOptions.body = JSON.stringify(Cheney_options.body);
      }
    }

    console.log(`[Cheney] 请求接口 ${Cheney_method} ${Cheney_url}`, Cheney_options.body || '');

    try {
      const Cheney_res = await fetch(Cheney_url, Cheney_fetchOptions);
      let Cheney_body = null;
      try {
        Cheney_body = await Cheney_res.json();
      } catch (Cheney_parseErr) {
        console.error('[Cheney] 响应不是合法 JSON：', Cheney_parseErr);
      }

      const Cheney_okFlag = Cheney_res.ok && Cheney_body && Cheney_body.code === 0;
      if (Cheney_okFlag) {
        console.log(`[Cheney] 接口返回成功 ${Cheney_url}`, Cheney_body);
      } else {
        console.error(`[Cheney] 接口返回失败 ${Cheney_url}，HTTP ${Cheney_res.status}`, Cheney_body);
      }

      return {
        ok: Cheney_okFlag,
        status: Cheney_res.status,
        body: Cheney_body,
        url: Cheney_url
      };
    } catch (Cheney_netErr) {
      console.error('[Cheney] 网络请求异常：', Cheney_netErr);
      return {
        ok: false,
        status: 0,
        body: { code: -1, msg: `网络异常：${Cheney_netErr.message}`, data: {} },
        url: Cheney_url
      };
    }
  }

  /** 把数据格式化写入 <pre class="Cheney_code"> */
  function Cheney_renderJson(Cheney_el, Cheney_data, Cheney_isError) {
    if (!Cheney_el) return;
    Cheney_el.classList.toggle('Cheney_is-error', Boolean(Cheney_isError));
    try {
      Cheney_el.textContent = typeof Cheney_data === 'string' ? Cheney_data : JSON.stringify(Cheney_data, null, 2);
    } catch (Cheney_err) {
      console.error('[Cheney] JSON 格式化失败：', Cheney_err);
      Cheney_el.textContent = String(Cheney_data);
    }
  }

  /** 复制文本到剪贴板（无第三方库实现） */
  async function Cheney_copy(Cheney_text, Cheney_btn) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(Cheney_text);
      } else {
        const Cheney_ta = document.createElement('textarea');
        Cheney_ta.value = Cheney_text;
        Cheney_ta.style.position = 'fixed';
        Cheney_ta.style.opacity = '0';
        document.body.appendChild(Cheney_ta);
        Cheney_ta.select();
        document.execCommand('copy');
        document.body.removeChild(Cheney_ta);
      }
      console.log('[Cheney] 已复制到剪贴板：', Cheney_text);
      if (Cheney_btn) {
        const Cheney_old = Cheney_btn.textContent;
        Cheney_btn.textContent = '已复制';
        setTimeout(() => { Cheney_btn.textContent = Cheney_old; }, 1500);
      }
    } catch (Cheney_err) {
      console.error('[Cheney] 复制失败：', Cheney_err);
    }
  }

  /** HTML 转义，避免接口数据直接插入页面造成样式错乱 */
  function Cheney_escape(Cheney_str) {
    return String(Cheney_str === null || Cheney_str === undefined ? '' : Cheney_str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.Cheney = {
    request: Cheney_request,
    renderJson: Cheney_renderJson,
    copy: Cheney_copy,
    escape: Cheney_escape,
    apiBase: Cheney_API_BASE
  };

  console.log('[Cheney] 公共请求工具已加载，接口前缀：', Cheney_API_BASE);
})();