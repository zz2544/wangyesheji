/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
 * 作用：知识库文件管理与 RAG 问答控制器
 */
const { Cheney_ok, Cheney_fail } = require('../config/Cheney_response');
const Cheney_knowledgeModel = require('../models/Cheney_knowledgeModel');
const Cheney_documentService = require('../services/Cheney_documentService');
const Cheney_ragService = require('../services/Cheney_ragService');

function Cheney_parseId(Cheney_value) {
  const Cheney_id = Number.parseInt(Cheney_value, 10);
  return Number.isInteger(Cheney_id) && Cheney_id > 0 ? Cheney_id : 0;
}

function Cheney_publicDocument(Cheney_document) {
  if (!Cheney_document) return null;
  const {
    Cheney_file_path,
    Cheney_stored_name,
    Cheney_sha256,
    Cheney_mime,
    ...Cheney_public
  } = Cheney_document;
  return Cheney_public;
}

/** POST /api/knowledge/upload */
async function Cheney_uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json(Cheney_fail('请选择要上传的知识库文件', 400));
    }
    const Cheney_document = await Cheney_documentService.Cheney_importFile(req.file);
    res.status(201).json(Cheney_ok(Cheney_publicDocument(Cheney_document), '知识库文件上传并解析成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** GET /api/knowledge/documents */
async function Cheney_listDocuments(req, res, next) {
  try {
    const Cheney_list = await Cheney_knowledgeModel.Cheney_findDocuments();
    res.json(Cheney_ok({ cheney_list: Cheney_list, cheney_total: Cheney_list.length }, '知识库文件列表获取成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** GET /api/knowledge/documents/:id */
async function Cheney_documentDetail(req, res, next) {
  try {
    const Cheney_id = Cheney_parseId(req.params.id);
    if (!Cheney_id) return res.status(400).json(Cheney_fail('知识库文件 ID 不合法', 400));
    const Cheney_document = await Cheney_knowledgeModel.Cheney_findDocumentById(Cheney_id);
    if (!Cheney_document) return res.status(404).json(Cheney_fail('知识库文件不存在', 404));
    const Cheney_chunks = await Cheney_knowledgeModel.Cheney_findChunks(Cheney_id);
    res.json(Cheney_ok({
      cheney_document: Cheney_publicDocument(Cheney_document),
      cheney_chunks: Cheney_chunks
    }, '知识库文件详情获取成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** DELETE /api/knowledge/documents/:id */
async function Cheney_removeDocument(req, res, next) {
  try {
    const Cheney_id = Cheney_parseId(req.params.id);
    if (!Cheney_id) return res.status(400).json(Cheney_fail('知识库文件 ID 不合法', 400));
    await Cheney_documentService.Cheney_removeFile(Cheney_id);
    res.json(Cheney_ok({ cheney_id: Cheney_id }, '知识库文件已删除'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** POST /api/knowledge/documents/:id/rebuild */
async function Cheney_rebuildDocument(req, res, next) {
  try {
    const Cheney_id = Cheney_parseId(req.params.id);
    if (!Cheney_id) return res.status(400).json(Cheney_fail('知识库文件 ID 不合法', 400));
    const Cheney_document = await Cheney_documentService.Cheney_rebuildFile(Cheney_id);
    res.json(Cheney_ok(Cheney_publicDocument(Cheney_document), '知识库文件重新解析成功'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

/** POST /api/knowledge/chat */
async function Cheney_chat(req, res, next) {
  try {
    const Cheney_question = String(req.body.question || '').trim();
    if (!Cheney_question) return res.status(400).json(Cheney_fail('请输入问题', 400));
    if (Cheney_question.length > 2000) return res.status(400).json(Cheney_fail('问题不能超过 2000 个字符', 400));
    const Cheney_documentId = req.body.documentId ? Cheney_parseId(req.body.documentId) : 0;
    if (req.body.documentId && !Cheney_documentId) {
      return res.status(400).json(Cheney_fail('限定的知识库文件 ID 不合法', 400));
    }
    const Cheney_topK = Math.min(8, Math.max(1, Number.parseInt(req.body.topK, 10) || 5));
    const Cheney_result = await Cheney_ragService.Cheney_answerQuestion({
      question: Cheney_question,
      documentId: Cheney_documentId,
      topK: Cheney_topK
    });
    res.json(Cheney_ok(Cheney_result, Cheney_result.cheney_used_model ? '知识库问答完成' : '未检索到足够相关知识'));
  } catch (Cheney_err) {
    next(Cheney_err);
  }
}

module.exports = {
  Cheney_uploadDocument,
  Cheney_listDocuments,
  Cheney_documentDetail,
  Cheney_removeDocument,
  Cheney_rebuildDocument,
  Cheney_chat
};
