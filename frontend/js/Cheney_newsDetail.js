/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：新闻详情页逻辑（按 ?id= 调用 /api/news/:id）
 */
(function Cheney_newsDetailPage() {
  const Cheney_el = {
    apiLink: document.getElementById('Cheney_apiLink'),
    apiCode: document.getElementById('Cheney_apiCode'),
    copyApi: document.getElementById('Cheney_copyApi'),
    state: document.getElementById('Cheney_state'),
    detail: document.getElementById('Cheney_detail'),
    cover: document.getElementById('Cheney_cover'),
    title: document.getElementById('Cheney_title'),
    meta: document.getElementById('Cheney_meta'),
    summary: document.getElementById('Cheney_summary'),
    notice: document.getElementById('Cheney_notice'),
    kvId: document.getElementById('Cheney_kvId'),
    kvCategory: document.getElementById('Cheney_kvCategory'),
    kvSource: document.getElementById('Cheney_kvSource'),
    kvAuthor: document.getElementById('Cheney_kvAuthor'),
    kvTime: document.getElementById('Cheney_kvTime'),
    kvViews: document.getElementById('Cheney_kvViews')
  };

  const Cheney_id = Number(new URLSearchParams(location.search).get('id') || 0);

  if (!Cheney_id || Cheney_id <= 0) {
    Cheney_el.state.classList.add('Cheney_is-error');
    Cheney_el.state.textContent = '缺少合法的新闻 ID，请从新闻列表进入。';
    Cheney_el.apiCode.textContent = '未发起请求：URL 中缺少 ?id= 参数';
    console.error('[Cheney] 缺少新闻 ID，未发起请求');
    return;
  }

  const Cheney_apiUrl = `${location.origin}/api/news/${Cheney_id}`;
  Cheney_el.apiLink.textContent = Cheney_apiUrl;
  Cheney_el.apiLink.href = Cheney_apiUrl;

  Cheney_el.copyApi.addEventListener('click', () => {
    Cheney.copy(Cheney_apiUrl, Cheney_el.copyApi);
  });

  (async function Cheney_load() {
    const Cheney_res = await Cheney.request(`/news/${Cheney_id}`);
    Cheney.renderJson(Cheney_el.apiCode, Cheney_res.body, !Cheney_res.ok);

    if (!Cheney_res.ok || !Cheney_res.body.data) {
      Cheney_el.state.classList.add('Cheney_is-error');
      Cheney_el.state.textContent = `加载失败：${(Cheney_res.body && Cheney_res.body.msg) || '接口无响应'}（${Cheney_apiUrl}）`;
      console.error('[Cheney] 新闻详情加载失败', Cheney_res);
      return;
    }

    const Cheney_news = Cheney_res.body.data;
    Cheney_el.state.hidden = true;
    Cheney_el.detail.hidden = false;

    document.title = `${Cheney_news.Cheney_title} · 星穹科技资讯站`;
    Cheney_el.cover.src = Cheney_news.Cheney_cover || 'images/Cheney_news_ai.svg';
    Cheney_el.cover.alt = Cheney_news.Cheney_title;
    Cheney_el.title.textContent = Cheney_news.Cheney_title;
    Cheney_el.summary.textContent = Cheney_news.Cheney_summary;
    Cheney_el.meta.innerHTML = `
      <span class="Cheney_tag Cheney_tag--violet">${Cheney.escape(Cheney_news.Cheney_category)}</span>
      <span>${Cheney.escape(Cheney_news.Cheney_source)}</span>
      <span>${Cheney.escape(String(Cheney_news.Cheney_publish_time).slice(0, 16))}</span>
      <span>阅读 ${Cheney_news.Cheney_views}</span>`;
    Cheney_el.notice.textContent = '本条数据直接取自数据库表 Cheney_news 的对应记录，接口返回结构见上方 JSON 面板。';

    Cheney_el.kvId.textContent = Cheney_news.Cheney_id;
    Cheney_el.kvCategory.textContent = Cheney_news.Cheney_category;
    Cheney_el.kvSource.textContent = Cheney_news.Cheney_source;
    Cheney_el.kvAuthor.textContent = Cheney_news.Cheney_author;
    Cheney_el.kvTime.textContent = String(Cheney_news.Cheney_publish_time).slice(0, 19);
    Cheney_el.kvViews.textContent = Cheney_news.Cheney_views;

    console.log('[Cheney] 新闻详情渲染完成：', Cheney_news);
  })();
})();