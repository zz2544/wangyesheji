/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：科技新闻列表页逻辑（请求 /api/news，渲染卡片、分页、接口数据面板）
 */
(function Cheney_newsPage() {
  const Cheney_state = {
    page: 1,
    pageSize: 10,
    keyword: '',
    category: '',
    total: 0,
    list: []
  };

  const Cheney_el = {
    apiLink: document.getElementById('Cheney_apiLink'),
    apiCode: document.getElementById('Cheney_apiCode'),
    copyApi: document.getElementById('Cheney_copyApi'),
    toggleRaw: document.getElementById('Cheney_toggleRaw'),
    keyword: document.getElementById('Cheney_keyword'),
    category: document.getElementById('Cheney_category'),
    pageSize: document.getElementById('Cheney_pageSize'),
    searchBtn: document.getElementById('Cheney_searchBtn'),
    total: document.getElementById('Cheney_total'),
    state: document.getElementById('Cheney_state'),
    list: document.getElementById('Cheney_newsList'),
    pager: document.getElementById('Cheney_pager')
  };

  function Cheney_buildQuery() {
    return {
      keyword: Cheney_state.keyword,
      category: Cheney_state.category,
      page: Cheney_state.page,
      pageSize: Cheney_state.pageSize
    };
  }

  function Cheney_updateApiLink() {
    const Cheney_qs = new URLSearchParams();
    Object.entries(Cheney_buildQuery()).forEach(([Cheney_k, Cheney_v]) => {
      if (Cheney_v !== '' && Cheney_v !== null) Cheney_qs.append(Cheney_k, Cheney_v);
    });
    const Cheney_full = `${location.origin}/api/news?${Cheney_qs.toString()}`;
    Cheney_el.apiLink.textContent = Cheney_full;
    Cheney_el.apiLink.href = Cheney_full;
    return Cheney_full;
  }

  function Cheney_renderCards() {
    Cheney_el.list.innerHTML = Cheney_state.list
      .map((Cheney_news) => {
        const Cheney_cover = Cheney_news.Cheney_cover
          ? `<img src="${Cheney.escape(Cheney_news.Cheney_cover)}" alt="${Cheney.escape(Cheney_news.Cheney_title)}" loading="lazy" />`
          : '';
        return `
          <li class="Cheney_newsCard">
            <div class="Cheney_newsCard__cover">
              ${Cheney_cover}
              <span class="Cheney_newsCard__category">${Cheney.escape(Cheney_news.Cheney_category)}</span>
            </div>
            <div class="Cheney_newsCard__body">
              <h3 class="Cheney_newsCard__title">
                <a href="news-detail.html?id=${Cheney_news.Cheney_id}">${Cheney.escape(Cheney_news.Cheney_title)}</a>
              </h3>
              <p class="Cheney_newsCard__summary">${Cheney.escape(Cheney_news.Cheney_summary)}</p>
              <div class="Cheney_newsCard__meta">
                <span class="Cheney_newsCard__id">#${Cheney_news.Cheney_id}</span>
                <span>${Cheney.escape(Cheney_news.Cheney_source)} · ${Cheney.escape(Cheney_news.Cheney_author)}</span>
                <span>${Cheney.escape(String(Cheney_news.Cheney_publish_time).slice(0, 16))}</span>
                <span>阅读 ${Cheney_news.Cheney_views}</span>
              </div>
            </div>
          </li>`;
      })
      .join('');
  }

  function Cheney_renderPager() {
    const Cheney_totalPage = Math.max(1, Math.ceil(Cheney_state.total / Cheney_state.pageSize));
    if (Cheney_state.total === 0) {
      Cheney_el.pager.hidden = true;
      return;
    }
    Cheney_el.pager.hidden = false;
    Cheney_el.pager.innerHTML = `
      <button class="Cheney_btn Cheney_btn--ghost" type="button" data-cheney-page="prev" ${Cheney_state.page <= 1 ? 'disabled' : ''}>← 上一页</button>
      <span class="Cheney_pager__info">第 ${Cheney_state.page} / ${Cheney_totalPage} 页</span>
      <button class="Cheney_btn Cheney_btn--ghost" type="button" data-cheney-page="next" ${Cheney_state.page >= Cheney_totalPage ? 'disabled' : ''}>下一页 →</button>
    `;
  }

  function Cheney_fillCategories() {
    const Cheney_categories = [...new Set(Cheney_state.list.map((Cheney_n) => Cheney_n.Cheney_category))];
    const Cheney_exists = [...Cheney_el.category.options].map((Cheney_o) => Cheney_o.value);
    Cheney_categories.forEach((Cheney_c) => {
      if (!Cheney_exists.includes(Cheney_c)) {
        const Cheney_option = document.createElement('option');
        Cheney_option.value = Cheney_c;
        Cheney_option.textContent = Cheney_c;
        Cheney_el.category.appendChild(Cheney_option);
      }
    });
  }

  async function Cheney_load() {
    Cheney_el.state.hidden = false;
    Cheney_el.state.classList.remove('Cheney_is-error');
    Cheney_el.state.textContent = '正在加载新闻数据…';

    const Cheney_apiUrl = Cheney_updateApiLink();
    const Cheney_res = await Cheney.request('/news', { query: Cheney_buildQuery() });

    Cheney.renderJson(Cheney_el.apiCode, Cheney_res.body, !Cheney_res.ok);

    if (!Cheney_res.ok || !Cheney_res.body || !Cheney_res.body.data) {
      Cheney_el.state.hidden = false;
      Cheney_el.state.classList.add('Cheney_is-error');
      Cheney_el.state.textContent = `加载失败：${(Cheney_res.body && Cheney_res.body.msg) || '接口无响应'}（接口地址 ${Cheney_apiUrl}）`;
      Cheney_el.list.innerHTML = '';
      Cheney_el.pager.hidden = true;
      Cheney_el.total.textContent = '0';
      console.error('[Cheney] 新闻列表加载失败', Cheney_res);
      return;
    }

    Cheney_state.list = Cheney_res.body.data.cheney_list || [];
    Cheney_state.total = Cheney_res.body.data.cheney_total || 0;
    Cheney_el.total.textContent = Cheney_state.total;

    if (Cheney_state.list.length === 0) {
      Cheney_el.state.hidden = false;
      Cheney_el.state.textContent = '没有匹配的新闻，试试更换关键词或分类。';
      Cheney_el.list.innerHTML = '';
      Cheney_el.pager.hidden = true;
      return;
    }

    Cheney_el.state.hidden = true;
    Cheney_fillCategories();
    Cheney_renderCards();
    Cheney_renderPager();
    console.log(`[Cheney] 新闻列表渲染完成，共 ${Cheney_state.total} 条，当前第 ${Cheney_state.page} 页`);
  }

  function Cheney_bindEvents() {
    Cheney_el.searchBtn.addEventListener('click', () => {
      Cheney_state.keyword = Cheney_el.keyword.value.trim();
      Cheney_state.category = Cheney_el.category.value;
      Cheney_state.pageSize = Number(Cheney_el.pageSize.value);
      Cheney_state.page = 1;
      Cheney_load();
    });

    Cheney_el.keyword.addEventListener('keydown', (Cheney_e) => {
      if (Cheney_e.key === 'Enter') Cheney_el.searchBtn.click();
    });

    Cheney_el.category.addEventListener('change', () => Cheney_el.searchBtn.click());
    Cheney_el.pageSize.addEventListener('change', () => Cheney_el.searchBtn.click());

    Cheney_el.pager.addEventListener('click', (Cheney_e) => {
      const Cheney_btn = Cheney_e.target.closest('[data-cheney-page]');
      if (!Cheney_btn) return;
      const Cheney_dir = Cheney_btn.dataset.cheneyPage;
      const Cheney_totalPage = Math.max(1, Math.ceil(Cheney_state.total / Cheney_state.pageSize));
      if (Cheney_dir === 'prev' && Cheney_state.page > 1) Cheney_state.page -= 1;
      if (Cheney_dir === 'next' && Cheney_state.page < Cheney_totalPage) Cheney_state.page += 1;
      Cheney_load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    Cheney_el.copyApi.addEventListener('click', () => {
      Cheney.copy(Cheney_el.apiLink.textContent, Cheney_el.copyApi);
    });

    Cheney_el.toggleRaw.addEventListener('click', () => {
      const Cheney_hidden = Cheney_el.apiCode.hidden;
      Cheney_el.apiCode.hidden = !Cheney_hidden;
      Cheney_el.toggleRaw.textContent = Cheney_hidden ? '收起返回数据' : '展开返回数据';
    });
  }

  Cheney_bindEvents();
  Cheney_load();
})();