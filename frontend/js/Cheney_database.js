/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：数据库连接测试页逻辑（提交 /api/database/test，渲染成功/失败提示与表信息）
 */
(function Cheney_databasePage() {
  const Cheney_el = {
    form: document.getElementById('Cheney_dbForm'),
    user: document.getElementById('Cheney_user'),
    password: document.getElementById('Cheney_password'),
    host: document.getElementById('Cheney_host'),
    port: document.getElementById('Cheney_port'),
    database: document.getElementById('Cheney_database'),
    submit: document.getElementById('Cheney_submit'),
    reset: document.getElementById('Cheney_reset'),
    alert: document.getElementById('Cheney_resultAlert'),
    resultText: document.getElementById('Cheney_resultText'),
    dbInfo: document.getElementById('Cheney_dbInfo'),
    tableBody: document.getElementById('Cheney_tableBody'),
    apiLink: document.getElementById('Cheney_apiLink'),
    apiCode: document.getElementById('Cheney_apiCode'),
    copyApi: document.getElementById('Cheney_copyApi'),
    toggleRaw: document.getElementById('Cheney_toggleRaw')
  };

  Cheney_el.apiLink.textContent = `${location.origin}/api/database/test`;
  console.log('[Cheney] 数据库测试接口：POST', Cheney_el.apiLink.textContent);

  function Cheney_setAlert(Cheney_type, Cheney_html) {
    Cheney_el.alert.className = `Cheney_alert Cheney_alert--${Cheney_type}`;
    const Cheney_icon = Cheney_type === 'success' ? '✓' : Cheney_type === 'error' ? '✕' : 'i';
    Cheney_el.alert.innerHTML = `<span class="Cheney_alert__icon">${Cheney_icon}</span><div>${Cheney_html}</div>`;
  }

  function Cheney_renderInfo(Cheney_data) {
    const Cheney_items = [
      ['MySQL 版本', Cheney_data.cheney_version],
      ['当前数据库', Cheney_data.cheney_database],
      ['连接耗时', `${Cheney_data.cheney_cost} ms`]
    ];
    Cheney_el.dbInfo.innerHTML = Cheney_items
      .map(([Cheney_k, Cheney_v]) => `
        <div class="Cheney_dbKv__item">
          <span class="Cheney_dbKv__k">${Cheney_k}</span>
          <span class="Cheney_dbKv__v">${Cheney.escape(Cheney_v)}</span>
        </div>`)
      .join('');
  }

  function Cheney_renderTables(Cheney_tables) {
    if (!Cheney_tables || Cheney_tables.length === 0) {
      Cheney_el.tableBody.innerHTML = '<tr><td colspan="2">未获取到数据表信息</td></tr>';
      return;
    }
    Cheney_el.tableBody.innerHTML = Cheney_tables
      .map((Cheney_t) => `
        <tr>
          <td>${Cheney.escape(Cheney_t.cheney_table)}</td>
          <td>${Cheney_t.cheney_rows === null ? '未知' : Cheney_t.cheney_rows}</td>
        </tr>`)
      .join('');
  }

  async function Cheney_doTest() {
    const Cheney_body = {
      user: Cheney_el.user.value.trim(),
      password: Cheney_el.password.value,
      host: Cheney_el.host.value.trim(),
      port: Cheney_el.port.value.trim(),
      database: Cheney_el.database.value.trim()
    };

    Cheney_el.submit.disabled = true;
    Cheney_el.submit.textContent = '连接中…';
    Cheney_setAlert('info', '正在测试数据库连接，请稍候…');

    const Cheney_res = await Cheney.request('/database/test', { method: 'POST', body: Cheney_body });
    Cheney.renderJson(Cheney_el.apiCode, Cheney_res.body, !Cheney_res.ok);

    Cheney_el.submit.disabled = false;
    Cheney_el.submit.textContent = '测试连接';

    if (Cheney_res.ok && Cheney_res.body.data) {
      Cheney_setAlert('success', `<strong>连接成功</strong>　${Cheney.escape(Cheney_res.body.msg)}`);
      Cheney_renderInfo(Cheney_res.body.data);
      Cheney_renderTables(Cheney_res.body.data.cheney_tables);
      console.log('[Cheney] 数据库连接成功：', Cheney_res.body.data);
      return;
    }

    const Cheney_msg = (Cheney_res.body && Cheney_res.body.msg) || '未知错误';
    Cheney_setAlert('error', `<strong>连接失败</strong>　${Cheney.escape(Cheney_msg)}`);
    Cheney_el.dbInfo.innerHTML = '<div class="Cheney_dbKv__item"><span class="Cheney_dbKv__k">提示</span><span class="Cheney_dbKv__v">请检查账号密码 / MySQL 服务状态</span></div>';
    Cheney_el.tableBody.innerHTML = '<tr><td colspan="2">连接失败，无法读取表信息</td></tr>';
    console.error('[Cheney] 数据库连接失败：', Cheney_msg, Cheney_res.body);
  }

  Cheney_el.form.addEventListener('submit', (Cheney_e) => {
    Cheney_e.preventDefault();
    Cheney_doTest();
  });

  Cheney_el.reset.addEventListener('click', () => {
    Cheney_el.user.value = 'root';
    Cheney_el.password.value = '123456';
    Cheney_el.host.value = '127.0.0.1';
    Cheney_el.port.value = '3306';
    Cheney_el.database.value = 'cheney_vibe_db';
    Cheney_setAlert('info', '已重置为默认值，可重新点击"测试连接"。');
    Cheney.renderJson(Cheney_el.apiCode, '等待测试…', false);
    console.log('[Cheney] 表单已重置为默认值');
  });

  document.querySelector('.Cheney_dbForm__quick').addEventListener('click', (Cheney_e) => {
    const Cheney_btn = Cheney_e.target.closest('[data-cheney-fill]');
    if (!Cheney_btn) return;
    const [Cheney_u, Cheney_p] = Cheney_btn.dataset.cheneyFill.split(':');
    Cheney_el.user.value = Cheney_u;
    Cheney_el.password.value = Cheney_p;
    console.log('[Cheney] 快速填充账号：', Cheney_u, '/', Cheney_p);
  });

  Cheney_el.copyApi.addEventListener('click', () => {
    Cheney.copy(Cheney_el.apiLink.textContent, Cheney_el.copyApi);
  });

  Cheney_el.toggleRaw.addEventListener('click', () => {
    const Cheney_hidden = Cheney_el.apiCode.hidden;
    Cheney_el.apiCode.hidden = !Cheney_hidden;
    Cheney_el.toggleRaw.textContent = Cheney_hidden ? '收起返回数据' : '展开返回数据';
  });

  // 页面加载时读取后端 .env 中配置的库信息（GET /api/database/info）
  (async function Cheney_loadInfo() {
    const Cheney_res = await Cheney.request('/database/info');
    if (Cheney_res.ok && Cheney_res.body.data) {
      const Cheney_d = Cheney_res.body.data;
      Cheney_el.host.value = Cheney_d.cheney_host;
      Cheney_el.port.value = Cheney_d.cheney_port;
      Cheney_el.database.value = Cheney_d.cheney_database;
      Cheney_el.user.value = Cheney_d.cheney_user;
      Cheney_renderTables(Cheney_d.cheney_tables);
      Cheney_setAlert(
        'info',
        `后端当前配置：<strong>${Cheney.escape(Cheney_d.cheney_user)}@${Cheney.escape(Cheney_d.cheney_host)}:${Cheney_d.cheney_port}/${Cheney.escape(Cheney_d.cheney_database)}</strong>，
         新闻 <strong>${Cheney_d.cheney_newsCount}</strong> 条、图文 <strong>${Cheney_d.cheney_galleryCount}</strong> 组。填写密码后即可测试连接。`
      );
    } else {
      console.error('[Cheney] 读取后端数据库配置失败', Cheney_res);
    }
  })();
})();