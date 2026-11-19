/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：图文列表页逻辑（请求 /api/gallery，标签筛选，渲染图文卡片与接口数据面板）
 */
(function Cheney_galleryPage() {
  const Cheney_state = { tag: '', total: 0, list: [] };

  const Cheney_el = {
    apiLink: document.getElementById('Cheney_apiLink'),
    apiCode: document.getElementById('Cheney_apiCode'),
    copyApi: document.getElementById('Cheney_copyApi'),
    toggleRaw: document.getElementById('Cheney_toggleRaw'),
    filterBar: document.querySelector('.Cheney_filterBar'),
    state: document.getElementById('Cheney_state'),
    list: document.getElementById('Cheney_galleryList'),
    total: document.getElementById('Cheney_total')
  };

  function Cheney_updateApiLink() {
    const Cheney_qs = new URLSearchParams();
    if (Cheney_state.tag) Cheney_qs.append('tag', Cheney_state.tag);
    Cheney_qs.append('pageSize', '20');
    const Cheney_full = `${location.origin}/api/gallery?${Cheney_qs.toString()}`;
    Cheney_el.apiLink.textContent = Cheney_full;
    Cheney_el.apiLink.href = Cheney_full;
    return Cheney_full;
  }

  function Cheney_renderCards() {
    Cheney_el.list.innerHTML = Cheney_state.list
      .map((Cheney_item, Cheney_index) => {
        const Cheney_tags = String(Cheney_item.Cheney_tags || '')
          .split(',')
          .filter(Boolean)
          .map((Cheney_t) => `<span class="Cheney_tag Cheney_tag--violet">${Cheney.escape(Cheney_t)}</span>`)
          .join('');
        return `
          <li class="Cheney_galleryCard">
            <div class="Cheney_galleryCard__media">
              <img src="${Cheney.escape(Cheney_item.Cheney_image)}" alt="${Cheney.escape(Cheney_item.Cheney_title)}" loading="lazy" />
              <span class="Cheney_galleryCard__index">#${Cheney_item.Cheney_id}</span>
            </div>
            <div class="Cheney_galleryCard__body">
              <h3 class="Cheney_galleryCard__title">${Cheney.escape(Cheney_item.Cheney_title)}</h3>
              <p class="Cheney_galleryCard__intro">${Cheney.escape(Cheney_item.Cheney_intro)}</p>
              <div class="Cheney_galleryCard__meta">
                <span class="Cheney_tag">${Cheney.escape(Cheney_item.Cheney_place)}</span>
                <span>${Cheney.escape(String(Cheney_item.Cheney_shoot_date).slice(0, 10))}</span>
                <span>排序值 ${Cheney_item.Cheney_sort}</span>
              </div>
              <div class="Cheney_galleryCard__tags">${Cheney_tags}</div>
            </div>
          </li>`;
      })
      .join('');
  }

  async function Cheney_load() {
    Cheney_el.state.hidden = false;
    Cheney_el.state.classList.remove('Cheney_is-error');
    Cheney_el.state.textContent = '正在加载图文数据…';

    const Cheney_apiUrl = Cheney_updateApiLink();
    const Cheney_res = await Cheney.request('/gallery', {
      query: { tag: Cheney_state.tag, pageSize: 20 }
    });

    Cheney.renderJson(Cheney_el.apiCode, Cheney_res.body, !Cheney_res.ok);

    if (!Cheney_res.ok || !Cheney_res.body || !Cheney_res.body.data) {
      Cheney_el.state.hidden = false;
      Cheney_el.state.classList.add('Cheney_is-error');
      Cheney_el.state.textContent = `加载失败：${(Cheney_res.body && Cheney_res.body.msg) || '接口无响应'}（接口地址 ${Cheney_apiUrl}）`;
      Cheney_el.list.innerHTML = '';
      return;
    }

    Cheney_state.list = Cheney_res.body.data.cheney_list || [];
    Cheney_state.total = Cheney_res.body.data.cheney_total || 0;
    Cheney_el.total.textContent = Cheney_state.total;

    if (Cheney_state.list.length === 0) {
      Cheney_el.state.hidden = false;
      Cheney_el.state.textContent = '当前标签下暂无图文，试试切换其他标签。';
      Cheney_el.list.innerHTML = '';
      return;
    }

    Cheney_el.state.hidden = true;
    Cheney_renderCards();
    console.log(`[Cheney] 图文列表渲染完成，共 ${Cheney_state.total} 组，标签：${Cheney_state.tag || '全部'}`);
  }

  Cheney_el.filterBar.addEventListener('click', (Cheney_e) => {
    const Cheney_btn = Cheney_e.target.closest('[data-cheney-tag]');
    if (!Cheney_btn) return;
    Cheney_el.filterBar.querySelectorAll('.Cheney_chip').forEach((Cheney_chip) => Cheney_chip.classList.remove('Cheney_is-active'));
    Cheney_btn.classList.add('Cheney_is-active');
    Cheney_state.tag = Cheney_btn.dataset.cheneyTag;
    Cheney_load();
  });

  Cheney_el.copyApi.addEventListener('click', () => {
    Cheney.copy(Cheney_el.apiLink.textContent, Cheney_el.copyApi);
  });

  Cheney_el.toggleRaw.addEventListener('click', () => {
    const Cheney_hidden = Cheney_el.apiCode.hidden;
    Cheney_el.apiCode.hidden = !Cheney_hidden;
    Cheney_el.toggleRaw.textContent = Cheney_hidden ? '收起返回数据' : '展开返回数据';
  });

  Cheney_load();
})();