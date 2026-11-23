/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
 * 作用：本地 TF-IDF 知识检索、DeepSeek 问答与模型报文控制台日志
 */
const Cheney_knowledgeModel = require('../models/Cheney_knowledgeModel');

const Cheney_STOP_WORDS = new Set([
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '上', '也', '很', '到',
  '说', '要', '去', '你', '会', '着', '没', '看', '好', '这', '那', '它', '他', '她', '们', '请',
  '问', '与', '及', '或', '并', '等', '个', '为', '于', '对', '中', '吗', '呢', '什么', '如何',
  'the', 'is', 'are', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'what', 'how'
]);

function Cheney_makeError(Cheney_message, Cheney_status, Cheney_data = {}) {
  const Cheney_err = new Error(Cheney_message);
  Cheney_err.Cheney_status = Cheney_status;
  Cheney_err.Cheney_data = Cheney_data;
  return Cheney_err;
}

/** 中文单字 + 二元词组，英文数字按单词 */
function Cheney_tokenize(Cheney_text) {
  const Cheney_source = String(Cheney_text || '').toLowerCase();
  const Cheney_tokens = [];
  const Cheney_words = Cheney_source.match(/[a-z0-9_]{2,}/g) || [];
  Cheney_words.forEach((Cheney_word) => {
    if (!Cheney_STOP_WORDS.has(Cheney_word)) Cheney_tokens.push(Cheney_word);
  });
  const Cheney_chineseRuns = Cheney_source.match(/[\u4e00-\u9fff]+/g) || [];
  Cheney_chineseRuns.forEach((Cheney_run) => {
    for (let Cheney_index = 0; Cheney_index < Cheney_run.length; Cheney_index += 1) {
      const Cheney_char = Cheney_run[Cheney_index];
      if (!Cheney_STOP_WORDS.has(Cheney_char)) Cheney_tokens.push(Cheney_char);
      if (Cheney_index < Cheney_run.length - 1) {
        const Cheney_bigram = Cheney_run.slice(Cheney_index, Cheney_index + 2);
        if (!Cheney_STOP_WORDS.has(Cheney_bigram)) Cheney_tokens.push(Cheney_bigram);
      }
    }
  });
  return Cheney_tokens;
}

function Cheney_termCounts(Cheney_tokens) {
  const Cheney_counts = new Map();
  Cheney_tokens.forEach((Cheney_token) => {
    Cheney_counts.set(Cheney_token, (Cheney_counts.get(Cheney_token) || 0) + 1);
  });
  return Cheney_counts;
}

/** 小规模知识库使用本地 TF-IDF，无需外部向量数据库 */
async function Cheney_retrieve({ question, documentId = 0, topK = 5 }) {
  const Cheney_rows = await Cheney_knowledgeModel.Cheney_findReadyChunks(documentId);
  if (!Cheney_rows.length) return [];

  const Cheney_queryTokens = Cheney_tokenize(question);
  if (!Cheney_queryTokens.length) return [];
  const Cheney_queryCounts = Cheney_termCounts(Cheney_queryTokens);
  const Cheney_documents = Cheney_rows.map((Cheney_row) => ({
    row: Cheney_row,
    counts: Cheney_termCounts(Cheney_tokenize(Cheney_row.Cheney_content)),
    titleTokens: new Set(Cheney_tokenize(Cheney_row.Cheney_original_name))
  }));

  const Cheney_documentFrequency = new Map();
  Cheney_documents.forEach((Cheney_document) => {
    Cheney_document.counts.forEach((Cheney_count, Cheney_token) => {
      Cheney_documentFrequency.set(Cheney_token, (Cheney_documentFrequency.get(Cheney_token) || 0) + 1);
    });
  });

  const Cheney_total = Cheney_documents.length;
  const Cheney_idf = (Cheney_token) => Math.log(1 + Cheney_total / ((Cheney_documentFrequency.get(Cheney_token) || 0) + 1)) + 1;
  const Cheney_norms = Cheney_documents.map((Cheney_document) => {
    let Cheney_sum = 0;
    Cheney_document.counts.forEach((Cheney_count, Cheney_token) => {
      Cheney_sum += (Cheney_count * Cheney_idf(Cheney_token)) ** 2;
    });
    return Math.sqrt(Cheney_sum) || 1;
  });

  let Cheney_queryNorm = 0;
  Cheney_queryCounts.forEach((Cheney_count, Cheney_token) => {
    Cheney_queryNorm += (Cheney_count * Cheney_idf(Cheney_token)) ** 2;
  });
  Cheney_queryNorm = Math.sqrt(Cheney_queryNorm) || 1;

  const Cheney_normalizedQuestion = question.toLowerCase();
  return Cheney_documents.map((Cheney_document, Cheney_index) => {
    let Cheney_dot = 0;
    Cheney_queryCounts.forEach((Cheney_queryCount, Cheney_token) => {
      const Cheney_documentCount = Cheney_document.counts.get(Cheney_token) || 0;
      Cheney_dot += Cheney_queryCount * Cheney_documentCount * Cheney_idf(Cheney_token) ** 2;
    });
    let Cheney_score = Cheney_dot / (Cheney_queryNorm * Cheney_norms[Cheney_index]);
    const Cheney_content = Cheney_document.row.Cheney_content.toLowerCase();
    if (Cheney_normalizedQuestion.length >= 2 && Cheney_content.includes(Cheney_normalizedQuestion)) Cheney_score += 0.25;
    let Cheney_titleHits = 0;
    new Set(Cheney_queryTokens).forEach((Cheney_token) => {
      if (Cheney_document.titleTokens.has(Cheney_token)) Cheney_titleHits += 1;
    });
    Cheney_score += Math.min(0.12, Cheney_titleHits * 0.015);
    return {
      cheney_document_id: Cheney_document.row.Cheney_document_id,
      cheney_document_name: Cheney_document.row.Cheney_original_name,
      cheney_chunk_index: Cheney_document.row.Cheney_chunk_index,
      cheney_content: Cheney_document.row.Cheney_content,
      cheney_score: Number(Cheney_score.toFixed(4))
    };
  })
    .filter((Cheney_item) => Cheney_item.cheney_score >= 0.06)
    .sort((Cheney_a, Cheney_b) => Cheney_b.cheney_score - Cheney_a.cheney_score)
    .slice(0, topK)
    .map((Cheney_item) => ({
      ...Cheney_item,
      cheney_excerpt: Cheney_item.cheney_content.slice(0, 260)
    }));
}

function Cheney_buildMessages(Cheney_question, Cheney_sources) {
  const Cheney_context = Cheney_sources.map((Cheney_source) => (
    `【${Cheney_source.cheney_document_name}｜知识块 ${Cheney_source.cheney_chunk_index}】\n${Cheney_source.cheney_content}`
  )).join('\n\n').slice(0, 12000);
  return [
    {
      role: 'system',
      content: [
        '你是星穹科技资讯站的专属知识库客服。',
        '只能依据用户消息中提供的知识库内容回答，不得编造知识库之外的事实。',
        '回答应简洁、准确、直接；知识库信息不足时明确说明无法确定。',
        '回答末尾用“参考来源”列出实际使用的文档名和知识块序号。'
      ].join('\n')
    },
    {
      role: 'user',
      content: `以下是检索到的知识库内容：\n\n${Cheney_context}\n\n用户问题：${Cheney_question}\n\n请仅根据上述知识库内容作答。`
    }
  ];
}

async function Cheney_callDeepSeek(Cheney_messages) {
  const Cheney_apiKey = process.env.OPENAI_API_KEY;
  if (!Cheney_apiKey) {
    throw Cheney_makeError(
      'DeepSeek 尚未配置：请在 backend/.env 中设置 OPENAI_API_KEY 后重启服务',
      503
    );
  }
  const Cheney_baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
  const Cheney_url = `${Cheney_baseUrl}/chat/completions`;
  const Cheney_payload = {
    model: process.env.OPENAI_MODEL || 'deepseek-chat',
    messages: Cheney_messages,
    temperature: 0.2,
    stream: false
  };

  console.log('\n========== [DeepSeek] 发送给大模型的数据 ==========');
  console.log(`POST ${Cheney_url}`);
  console.log(JSON.stringify(Cheney_payload, null, 2));
  console.log('==================================================\n');

  try {
    const Cheney_response = await fetch(Cheney_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cheney_apiKey}`
      },
      body: JSON.stringify(Cheney_payload),
      signal: AbortSignal.timeout(60000)
    });
    const Cheney_raw = await Cheney_response.text();
    console.log('\n========== [DeepSeek] 接收自大模型的数据 ==========');
    console.log(`HTTP ${Cheney_response.status}`);
    console.log(Cheney_raw);
    console.log('==================================================\n');

    let Cheney_data;
    try {
      Cheney_data = JSON.parse(Cheney_raw);
    } catch (Cheney_err) {
      throw Cheney_makeError('DeepSeek 返回的不是合法 JSON', 502);
    }
    if (!Cheney_response.ok) {
      throw Cheney_makeError(
        `DeepSeek 调用失败：${Cheney_data.error?.message || `HTTP ${Cheney_response.status}`}`,
        502
      );
    }
    const Cheney_answer = Cheney_data.choices?.[0]?.message?.content?.trim();
    if (!Cheney_answer) throw Cheney_makeError('DeepSeek 响应中没有可用答案', 502);
    return { answer: Cheney_answer, data: Cheney_data };
  } catch (Cheney_err) {
    if (!Cheney_err.Cheney_status) {
      console.error('[DeepSeek] 请求异常：', Cheney_err.message);
      throw Cheney_makeError(`DeepSeek 请求异常：${Cheney_err.message}`, 502);
    }
    throw Cheney_err;
  }
}

async function Cheney_answerQuestion({ question, documentId = 0, topK = 5 }) {
  const Cheney_sources = await Cheney_retrieve({ question, documentId, topK });
  if (!Cheney_sources.length) {
    return {
      cheney_answer: '知识库未找到与该问题相关的内容。请换一种问法，或先上传包含相关知识的文章。',
      cheney_sources: [],
      cheney_used_model: false,
      cheney_model: null
    };
  }

  console.log(`[RAG] 问题：${question}`);
  console.log('[RAG] 检索结果：', Cheney_sources.map((Cheney_item) => ({
    文档: Cheney_item.cheney_document_name,
    知识块: Cheney_item.cheney_chunk_index,
    得分: Cheney_item.cheney_score
  })));

  try {
    const Cheney_messages = Cheney_buildMessages(question, Cheney_sources);
    const Cheney_result = await Cheney_callDeepSeek(Cheney_messages);
    return {
      cheney_answer: Cheney_result.answer,
      cheney_sources: Cheney_sources,
      cheney_used_model: true,
      cheney_model: Cheney_result.data.model || process.env.OPENAI_MODEL || 'deepseek-chat',
      cheney_usage: Cheney_result.data.usage || null
    };
  } catch (Cheney_err) {
    Cheney_err.Cheney_data = { ...Cheney_err.Cheney_data, cheney_sources: Cheney_sources };
    throw Cheney_err;
  }
}

module.exports = { Cheney_answerQuestion, Cheney_retrieve, Cheney_tokenize };
