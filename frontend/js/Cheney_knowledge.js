/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
 * 作用：知识库上传、文档管理、分块预览与 RAG 问答交互
 */
(function Cheney_knowledgePage() {
  const Cheney_ui = {
    uploadForm: document.getElementById('Cheney_uploadForm'),
    fileInput: document.getElementById('Cheney_fileInput'),
    fileName: document.getElementById('Cheney_fileName'),
    dropLabel: document.getElementById('Cheney_dropLabel'),
    uploadBtn: document.getElementById('Cheney_uploadBtn'),
    uploadStatus: document.getElementById('Cheney_uploadStatus'),
    refreshBtn: document.getElementById('Cheney_refreshBtn'),
    documentBody: document.getElementById('Cheney_documentBody'),
    manageStatus: document.getElementById('Cheney_manageStatus'),
    detailPanel: document.getElementById('Cheney_detailPanel'),
    detailTitle: document.getElementById('Cheney_detailTitle'),
    chunkList: document.getElementById('Cheney_chunkList'),
    closeDetail: document.getElementById('Cheney_closeDetail'),
    chatScope: document.getElementById('Cheney_chatScope'),
    messages: document.getElementById('Cheney_messages'),
    chatForm: document.getElementById('Cheney_chatForm'),
    question: document.getElementById('Cheney_question'),
    sendBtn: document.getElementById('Cheney_sendBtn')
  };
  let Cheney_documents = [];
  let Cheney_selectedDocumentId = 0;

  function Cheney_setOperation(Cheney_el, Cheney_text, Cheney_type = '') {
    Cheney_el.textContent = Cheney_text;
    Cheney_el.classList.toggle('Cheney_is-error', Cheney_type === 'error');
    Cheney_el.classList.toggle('Cheney_is-success', Cheney_type === 'success');
  }

  function Cheney_formatSize(Cheney_bytes) {
    const Cheney_size = Number(Cheney_bytes || 0);
    if (Cheney_size < 1024) return `${Cheney_size} B`;
    if (Cheney_size < 1024 * 1024) return `${(Cheney_size / 1024).toFixed(1)} KB`;
    return `${(Cheney_size / 1024 / 1024).toFixed(2)} MB`;
  }

  function Cheney_statusLabel(Cheney_status) {
    return { ready: '已就绪', failed: '解析失败', processing: '解析中' }[Cheney_status] || Cheney_status;
  }

  function Cheney_renderScope() {
    const Cheney_oldValue = Cheney_ui.chatScope.value;
    Cheney_ui.chatScope.innerHTML = '<option value="">全部知识文件</option>' + Cheney_documents
      .filter((Cheney_doc) => Cheney_doc.Cheney_status === 'ready')
      .map((Cheney_doc) => `<option value="${Cheney_doc.Cheney_id}">${Cheney.escape(Cheney_doc.Cheney_original_name)}</option>`)
      .join('');
    if (Array.from(Cheney_ui.chatScope.options).some((Cheney_option) => Cheney_option.value === Cheney_oldValue)) {
      Cheney_ui.chatScope.value = Cheney_oldValue;
    }
  }

  function Cheney_renderDocuments() {
    Cheney_renderScope();
    if (!Cheney_documents.length) {
      Cheney_ui.documentBody.innerHTML = '<tr><td colspan="6" class="Cheney_state">暂无知识文件，请先上传。</td></tr>';
      return;
    }
    Cheney_ui.documentBody.innerHTML = Cheney_documents.map((Cheney_doc) => {
      const Cheney_name = Cheney.escape(Cheney_doc.Cheney_original_name);
      const Cheney_error = Cheney_doc.Cheney_error
        ? `<span class="Cheney_kbFileError">${Cheney.escape(Cheney_doc.Cheney_error)}</span>` : '';
      return `<tr>
        <td><span class="Cheney_kbFileName" title="${Cheney_name}">${Cheney_name}</span>${Cheney_error}</td>
        <td>${Cheney.escape(String(Cheney_doc.Cheney_extension).toUpperCase())}</td>
        <td>${Cheney_formatSize(Cheney_doc.Cheney_size)}</td>
        <td>${Cheney_doc.Cheney_chunk_count}</td>
        <td><span class="Cheney_kbStatus Cheney_kbStatus--${Cheney.escape(Cheney_doc.Cheney_status)}">${Cheney_statusLabel(Cheney_doc.Cheney_status)}</span></td>
        <td><div class="Cheney_kbActions">
          <button class="Cheney_kbAction" type="button" data-cheney-action="view" data-cheney-id="${Cheney_doc.Cheney_id}">查看</button>
          <button class="Cheney_kbAction" type="button" data-cheney-action="rebuild" data-cheney-id="${Cheney_doc.Cheney_id}">重建</button>
          <button class="Cheney_kbAction Cheney_kbAction--danger" type="button" data-cheney-action="delete" data-cheney-id="${Cheney_doc.Cheney_id}">删除</button>
        </div></td>
      </tr>`;
    }).join('');
  }

  async function Cheney_loadDocuments() {
    Cheney_setOperation(Cheney_ui.manageStatus, '正在刷新…');
    const Cheney_result = await Cheney.request('/knowledge/documents');
    if (!Cheney_result.ok) {
      Cheney_setOperation(Cheney_ui.manageStatus, Cheney_result.body.msg || '列表加载失败', 'error');
      Cheney_ui.documentBody.innerHTML = '<tr><td colspan="6" class="Cheney_state Cheney_is-error">知识库列表加载失败</td></tr>';
      return;
    }
    Cheney_documents = Cheney_result.body.data.cheney_list || [];
    Cheney_renderDocuments();
    Cheney_setOperation(Cheney_ui.manageStatus, `共 ${Cheney_documents.length} 个知识文件`, 'success');
  }

  function Cheney_showFile() {
    const Cheney_file = Cheney_ui.fileInput.files[0];
    Cheney_ui.fileName.textContent = Cheney_file ? Cheney_file.name : '选择或拖入知识库文件';
    Cheney_setOperation(Cheney_ui.uploadStatus, Cheney_file ? `${Cheney_formatSize(Cheney_file.size)}，等待上传` : '等待选择文件');
  }

  async function Cheney_uploadFile(event) {
    event.preventDefault();
    const Cheney_file = Cheney_ui.fileInput.files[0];
    if (!Cheney_file) return Cheney_setOperation(Cheney_ui.uploadStatus, '请先选择文件', 'error');
    const Cheney_formData = new FormData();
    Cheney_formData.append('file', Cheney_file);
    Cheney_ui.uploadBtn.disabled = true;
    Cheney_ui.uploadBtn.textContent = '正在上传并解析…';
    Cheney_setOperation(Cheney_ui.uploadStatus, '文件解析可能需要一些时间，请稍候');
    try {
      const Cheney_result = await Cheney.request('/knowledge/upload', { method: 'POST', body: Cheney_formData });
      if (!Cheney_result.ok) {
        Cheney_setOperation(Cheney_ui.uploadStatus, Cheney_result.body.msg || '上传失败', 'error');
      } else {
        Cheney_setOperation(Cheney_ui.uploadStatus, '上传并解析成功', 'success');
        Cheney_ui.uploadForm.reset();
        Cheney_ui.fileName.textContent = '选择或拖入知识库文件';
      }
      await Cheney_loadDocuments();
    } finally {
      Cheney_ui.uploadBtn.disabled = false;
      Cheney_ui.uploadBtn.textContent = '上传并解析';
    }
  }

  async function Cheney_viewDocument(Cheney_id) {
    Cheney_setOperation(Cheney_ui.manageStatus, '正在读取文档分块…');
    const Cheney_result = await Cheney.request(`/knowledge/documents/${Cheney_id}`);
    if (!Cheney_result.ok) return Cheney_setOperation(Cheney_ui.manageStatus, Cheney_result.body.msg, 'error');
    const { cheney_document: Cheney_doc, cheney_chunks: Cheney_chunks } = Cheney_result.body.data;
    Cheney_selectedDocumentId = Cheney_id;
    Cheney_ui.detailTitle.textContent = Cheney_doc.Cheney_original_name;
    Cheney_ui.chunkList.innerHTML = Cheney_chunks.length ? Cheney_chunks.map((Cheney_chunk) => `
      <article class="Cheney_kbChunk">
        <span class="Cheney_kbChunk__label">知识块 ${Cheney_chunk.Cheney_chunk_index}</span>
        <p>${Cheney.escape(Cheney_chunk.Cheney_content)}</p>
      </article>`).join('') : '<div class="Cheney_state">该文件没有可展示的知识块。</div>';
    Cheney_ui.detailPanel.hidden = false;
    Cheney_ui.detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    Cheney_setOperation(Cheney_ui.manageStatus, `已加载 ${Cheney_chunks.length} 个知识块`, 'success');
  }

  async function Cheney_rebuildDocument(Cheney_id) {
    Cheney_setOperation(Cheney_ui.manageStatus, '正在重新解析，请稍候…');
    const Cheney_result = await Cheney.request(`/knowledge/documents/${Cheney_id}/rebuild`, { method: 'POST' });
    Cheney_setOperation(Cheney_ui.manageStatus, Cheney_result.body.msg, Cheney_result.ok ? 'success' : 'error');
    if (Cheney_selectedDocumentId === Cheney_id) Cheney_ui.detailPanel.hidden = true;
    await Cheney_loadDocuments();
  }

  async function Cheney_deleteDocument(Cheney_id) {
    const Cheney_doc = Cheney_documents.find((Cheney_item) => Cheney_item.Cheney_id === Cheney_id);
    if (!window.confirm(`确定删除“${Cheney_doc ? Cheney_doc.Cheney_original_name : '该文件'}”及其全部分块吗？`)) return;
    const Cheney_result = await Cheney.request(`/knowledge/documents/${Cheney_id}`, { method: 'DELETE' });
    Cheney_setOperation(Cheney_ui.manageStatus, Cheney_result.body.msg, Cheney_result.ok ? 'success' : 'error');
    if (Cheney_selectedDocumentId === Cheney_id) Cheney_ui.detailPanel.hidden = true;
    await Cheney_loadDocuments();
  }

  function Cheney_appendMessage(Cheney_role, Cheney_text, Cheney_sources = [], Cheney_isError = false) {
    const Cheney_article = document.createElement('article');
    Cheney_article.className = `Cheney_kbMessage Cheney_kbMessage--${Cheney_role}${Cheney_isError ? ' Cheney_kbMessage--error' : ''}`;
    const Cheney_roleEl = document.createElement('span');
    Cheney_roleEl.className = 'Cheney_kbMessage__role';
    Cheney_roleEl.textContent = Cheney_role === 'user' ? '我' : '知识库客服';
    const Cheney_textEl = document.createElement('p');
    Cheney_textEl.textContent = Cheney_text;
    Cheney_article.append(Cheney_roleEl, Cheney_textEl);
    if (Cheney_sources.length) {
      const Cheney_sourceBox = document.createElement('div');
      Cheney_sourceBox.className = 'Cheney_kbSources';
      Cheney_sources.forEach((Cheney_source) => {
        const Cheney_item = document.createElement('div');
        Cheney_item.className = 'Cheney_kbSource';
        const Cheney_title = document.createElement('span');
        Cheney_title.className = 'Cheney_kbSource__title';
        Cheney_title.textContent = `${Cheney_source.cheney_document_name} · 知识块 ${Cheney_source.cheney_chunk_index} · 相关度 ${Cheney_source.cheney_score}`;
        const Cheney_excerpt = document.createElement('span');
        Cheney_excerpt.className = 'Cheney_kbSource__text';
        Cheney_excerpt.textContent = Cheney_source.cheney_excerpt;
        Cheney_item.append(Cheney_title, Cheney_excerpt);
        Cheney_sourceBox.appendChild(Cheney_item);
      });
      Cheney_article.appendChild(Cheney_sourceBox);
    }
    Cheney_ui.messages.appendChild(Cheney_article);
    Cheney_ui.messages.scrollTop = Cheney_ui.messages.scrollHeight;
    return Cheney_article;
  }

  async function Cheney_askQuestion(event) {
    event.preventDefault();
    const Cheney_question = Cheney_ui.question.value.trim();
    if (!Cheney_question || Cheney_ui.sendBtn.disabled) return;
    Cheney_appendMessage('user', Cheney_question);
    Cheney_ui.question.value = '';
    Cheney_ui.sendBtn.disabled = true;
    Cheney_ui.sendBtn.textContent = '正在检索与生成…';
    const Cheney_pending = Cheney_appendMessage('assistant', '正在检索知识库并等待 DeepSeek 回答…');
    try {
      const Cheney_documentId = Cheney_ui.chatScope.value ? Number(Cheney_ui.chatScope.value) : undefined;
      const Cheney_result = await Cheney.request('/knowledge/chat', {
        method: 'POST',
        body: { question: Cheney_question, documentId: Cheney_documentId, topK: 5 }
      });
      Cheney_pending.remove();
      if (Cheney_result.ok) {
        const Cheney_data = Cheney_result.body.data;
        Cheney_appendMessage('assistant', Cheney_data.cheney_answer, Cheney_data.cheney_sources || []);
      } else {
        Cheney_appendMessage('assistant', Cheney_result.body.msg || '问答请求失败', Cheney_result.body.data.cheney_sources || [], true);
      }
    } finally {
      Cheney_pending.remove();
      Cheney_ui.sendBtn.disabled = false;
      Cheney_ui.sendBtn.textContent = '发送问题';
      Cheney_ui.question.focus();
    }
  }

  Cheney_ui.uploadForm.addEventListener('submit', Cheney_uploadFile);
  Cheney_ui.fileInput.addEventListener('change', Cheney_showFile);
  Cheney_ui.refreshBtn.addEventListener('click', Cheney_loadDocuments);
  Cheney_ui.closeDetail.addEventListener('click', () => { Cheney_ui.detailPanel.hidden = true; });
  Cheney_ui.chatForm.addEventListener('submit', Cheney_askQuestion);
  Cheney_ui.documentBody.addEventListener('click', (Cheney_event) => {
    const Cheney_button = Cheney_event.target.closest('[data-cheney-action]');
    if (!Cheney_button) return;
    const Cheney_id = Number(Cheney_button.dataset.cheneyId);
    if (Cheney_button.dataset.cheneyAction === 'view') Cheney_viewDocument(Cheney_id);
    if (Cheney_button.dataset.cheneyAction === 'rebuild') Cheney_rebuildDocument(Cheney_id);
    if (Cheney_button.dataset.cheneyAction === 'delete') Cheney_deleteDocument(Cheney_id);
  });
  document.querySelectorAll('[data-cheney-question]').forEach((Cheney_button) => {
    Cheney_button.addEventListener('click', () => {
      Cheney_ui.question.value = Cheney_button.dataset.cheneyQuestion;
      Cheney_ui.chatForm.requestSubmit();
    });
  });

  ['dragenter', 'dragover'].forEach((Cheney_eventName) => {
    Cheney_ui.dropLabel.addEventListener(Cheney_eventName, (Cheney_event) => {
      Cheney_event.preventDefault();
      Cheney_ui.dropLabel.classList.add('Cheney_is-dragging');
    });
  });
  ['dragleave', 'drop'].forEach((Cheney_eventName) => {
    Cheney_ui.dropLabel.addEventListener(Cheney_eventName, (Cheney_event) => {
      Cheney_event.preventDefault();
      Cheney_ui.dropLabel.classList.remove('Cheney_is-dragging');
    });
  });
  Cheney_ui.dropLabel.addEventListener('drop', (Cheney_event) => {
    if (!Cheney_event.dataTransfer.files.length) return;
    Cheney_ui.fileInput.files = Cheney_event.dataTransfer.files;
    Cheney_showFile();
  });

  Cheney_loadDocuments();
})();
