/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
 * 作用：知识库文件上传、签名校验、格式解析、文本分块与磁盘管理
 */
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const multer = require('multer');
const mammoth = require('mammoth');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');
const Cheney_knowledgeModel = require('../models/Cheney_knowledgeModel');

const Cheney_backendDir = path.join(__dirname, '..');
const Cheney_uploadDir = path.join(Cheney_backendDir, 'storage', 'Cheney_uploads');
const Cheney_tempDir = path.join(Cheney_backendDir, 'storage', 'Cheney_temp');
const Cheney_convertScript = path.join(Cheney_backendDir, 'scripts', 'Cheney_convertOffice.ps1');
const Cheney_ALLOWED = new Set(['.pdf', '.txt', '.doc', '.docx', '.ppt', '.pptx']);
const Cheney_MAX_TEXT_LENGTH = 1000000;

fs.mkdirSync(Cheney_uploadDir, { recursive: true });
fs.mkdirSync(Cheney_tempDir, { recursive: true });

function Cheney_makeError(Cheney_message, Cheney_status = 400, Cheney_data = {}) {
  const Cheney_err = new Error(Cheney_message);
  Cheney_err.Cheney_status = Cheney_status;
  Cheney_err.Cheney_data = Cheney_data;
  return Cheney_err;
}

const Cheney_upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, Cheney_uploadDir),
    filename: (req, file, cb) => {
      const Cheney_ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${Cheney_ext}`);
    }
  }),
  defParamCharset: 'utf8',
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const Cheney_ext = path.extname(file.originalname).toLowerCase();
    if (!Cheney_ALLOWED.has(Cheney_ext)) {
      return cb(Cheney_makeError('仅支持 PDF、TXT、DOC、DOCX、PPT、PPTX 文件', 415));
    }
    cb(null, true);
  }
});

const Cheney_singleUpload = Cheney_upload.single('file');
function Cheney_uploadMiddleware(req, res, next) {
  Cheney_singleUpload(req, res, (Cheney_err) => {
    if (!Cheney_err) return next();
    if (Cheney_err.code === 'LIMIT_FILE_SIZE') {
      return next(Cheney_makeError('文件不能超过 20MB', 400));
    }
    if (Cheney_err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(Cheney_makeError('每次只能上传一个文件，字段名必须为 file', 400));
    }
    Cheney_err.Cheney_status = Cheney_err.Cheney_status || 400;
    next(Cheney_err);
  });
}

function Cheney_assertSignature(Cheney_buffer, Cheney_ext) {
  const Cheney_hex = Cheney_buffer.subarray(0, 8).toString('hex');
  if (Cheney_ext === '.pdf' && Cheney_buffer.subarray(0, 5).toString() !== '%PDF-') {
    throw Cheney_makeError('PDF 文件签名不正确，文件可能已损坏或扩展名被修改');
  }
  if (['.doc', '.ppt'].includes(Cheney_ext) && Cheney_hex !== 'd0cf11e0a1b11ae1') {
    throw Cheney_makeError(`${Cheney_ext} 不是有效的旧版 Office OLE 文件`);
  }
  if (['.docx', '.pptx'].includes(Cheney_ext) && !Cheney_hex.startsWith('504b')) {
    throw Cheney_makeError(`${Cheney_ext} 不是有效的 Office Open XML 压缩文件`);
  }
  if (Cheney_ext === '.txt' && Cheney_buffer.subarray(0, 4096).includes(0)) {
    throw Cheney_makeError('TXT 文件包含二进制内容，无法按文本解析');
  }
}

async function Cheney_validateZip(Cheney_buffer, Cheney_ext) {
  let Cheney_zip;
  try {
    Cheney_zip = await JSZip.loadAsync(Cheney_buffer);
  } catch (Cheney_err) {
    throw Cheney_makeError('Office 文件无法解包，文件可能已损坏');
  }
  const Cheney_required = Cheney_ext === '.docx' ? 'word/document.xml' : 'ppt/presentation.xml';
  if (!Cheney_zip.file(Cheney_required)) {
    throw Cheney_makeError(`文件内容与 ${Cheney_ext} 格式不符`);
  }
  return Cheney_zip;
}

function Cheney_normalizeText(Cheney_text) {
  const Cheney_normalized = String(Cheney_text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!Cheney_normalized) {
    throw Cheney_makeError('没有从文件中提取到文本；扫描版 PDF 请先进行 OCR');
  }
  if (Cheney_normalized.length > Cheney_MAX_TEXT_LENGTH) {
    throw Cheney_makeError('解析后的文本超过 100 万字符，请拆分文件后上传');
  }
  return Cheney_normalized;
}

async function Cheney_parsePdf(Cheney_buffer) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const Cheney_task = getDocument({
    data: new Uint8Array(Cheney_buffer),
    isEvalSupported: false,
    disableFontFace: true,
    verbosity: 0
  });
  let Cheney_pdf;
  try {
    Cheney_pdf = await Cheney_task.promise;
    const Cheney_pages = [];
    for (let Cheney_pageNo = 1; Cheney_pageNo <= Cheney_pdf.numPages; Cheney_pageNo += 1) {
      const Cheney_page = await Cheney_pdf.getPage(Cheney_pageNo);
      const Cheney_content = await Cheney_page.getTextContent();
      const Cheney_text = Cheney_content.items.map((Cheney_item) => Cheney_item.str || '').join(' ');
      Cheney_pages.push(`第 ${Cheney_pageNo} 页\n${Cheney_text}`);
      Cheney_page.cleanup();
    }
    return Cheney_pages.join('\n\n');
  } finally {
    await Cheney_task.destroy();
  }
}

async function Cheney_parseDocx(Cheney_buffer) {
  const Cheney_result = await mammoth.extractRawText({ buffer: Cheney_buffer });
  return Cheney_result.value;
}

function Cheney_collectSlideText(Cheney_node, Cheney_output) {
  if (Array.isArray(Cheney_node)) {
    Cheney_node.forEach((Cheney_item) => Cheney_collectSlideText(Cheney_item, Cheney_output));
    return;
  }
  if (!Cheney_node || typeof Cheney_node !== 'object') return;
  Object.entries(Cheney_node).forEach(([Cheney_key, Cheney_value]) => {
    if (Cheney_key === 'a:t') {
      if (Array.isArray(Cheney_value)) Cheney_output.push(...Cheney_value.map(String));
      else Cheney_output.push(String(Cheney_value));
    } else {
      Cheney_collectSlideText(Cheney_value, Cheney_output);
    }
  });
}

async function Cheney_parsePptx(Cheney_buffer) {
  const Cheney_zip = await Cheney_validateZip(Cheney_buffer, '.pptx');
  const Cheney_parser = new XMLParser({ ignoreAttributes: true, trimValues: false });
  const Cheney_slideNames = Object.keys(Cheney_zip.files)
    .filter((Cheney_name) => /^ppt\/slides\/slide\d+\.xml$/.test(Cheney_name))
    .sort((Cheney_a, Cheney_b) => {
      const Cheney_numA = Number(Cheney_a.match(/slide(\d+)\.xml$/)[1]);
      const Cheney_numB = Number(Cheney_b.match(/slide(\d+)\.xml$/)[1]);
      return Cheney_numA - Cheney_numB;
    });
  const Cheney_pages = [];
  for (const Cheney_name of Cheney_slideNames) {
    const Cheney_xml = await Cheney_zip.file(Cheney_name).async('string');
    const Cheney_parsed = Cheney_parser.parse(Cheney_xml);
    const Cheney_texts = [];
    Cheney_collectSlideText(Cheney_parsed, Cheney_texts);
    const Cheney_pageNo = Cheney_name.match(/slide(\d+)\.xml$/)[1];
    Cheney_pages.push(`第 ${Cheney_pageNo} 页\n${Cheney_texts.join(' ')}`);
  }
  return Cheney_pages.join('\n\n');
}

function Cheney_parseTxt(Cheney_buffer) {
  if (Cheney_buffer[0] === 0xff && Cheney_buffer[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(Cheney_buffer);
  }
  if (Cheney_buffer[0] === 0xfe && Cheney_buffer[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(Cheney_buffer);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Cheney_buffer);
  } catch (Cheney_err) {
    return new TextDecoder('gb18030').decode(Cheney_buffer);
  }
}

function Cheney_runOfficeConverter(Cheney_input, Cheney_output, Cheney_ext) {
  return new Promise((resolve, reject) => {
    const Cheney_args = [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', Cheney_convertScript,
      '-InputPath', Cheney_input,
      '-OutputPath', Cheney_output,
      '-Kind', Cheney_ext === '.doc' ? 'word' : 'powerpoint'
    ];
    const Cheney_child = spawn('powershell.exe', Cheney_args, { windowsHide: true });
    let Cheney_stdout = '';
    let Cheney_stderr = '';
    const Cheney_timer = setTimeout(() => {
      Cheney_child.kill();
      reject(Cheney_makeError('Microsoft Office 文件转换超时，请确认文件可以正常打开', 500));
    }, 90000);
    Cheney_child.stdout.on('data', (Cheney_data) => { Cheney_stdout += Cheney_data.toString(); });
    Cheney_child.stderr.on('data', (Cheney_data) => { Cheney_stderr += Cheney_data.toString(); });
    Cheney_child.on('error', (Cheney_err) => {
      clearTimeout(Cheney_timer);
      reject(Cheney_makeError(`无法启动 Office 转换器：${Cheney_err.message}`, 500));
    });
    Cheney_child.on('close', (Cheney_code) => {
      clearTimeout(Cheney_timer);
      if (Cheney_code === 0) return resolve();
      reject(Cheney_makeError(
        `旧版 Office 文件转换失败：${(Cheney_stderr || Cheney_stdout || `退出码 ${Cheney_code}`).slice(-1200)}`,
        500
      ));
    });
  });
}

async function Cheney_parseLegacy(Cheney_filePath, Cheney_ext) {
  const Cheney_workDir = await fsp.mkdtemp(path.join(Cheney_tempDir, 'convert-'));
  const Cheney_output = path.join(Cheney_workDir, Cheney_ext === '.doc' ? 'converted.docx' : 'converted.pptx');
  try {
    await Cheney_runOfficeConverter(Cheney_filePath, Cheney_output, Cheney_ext);
    const Cheney_buffer = await fsp.readFile(Cheney_output);
    return Cheney_ext === '.doc'
      ? Cheney_parseDocx(Cheney_buffer)
      : Cheney_parsePptx(Cheney_buffer);
  } finally {
    await fsp.rm(Cheney_workDir, { recursive: true, force: true });
  }
}

async function Cheney_extractText(Cheney_filePath, Cheney_ext) {
  if (['.doc', '.ppt'].includes(Cheney_ext)) {
    return Cheney_normalizeText(await Cheney_parseLegacy(Cheney_filePath, Cheney_ext));
  }
  const Cheney_buffer = await fsp.readFile(Cheney_filePath);
  Cheney_assertSignature(Cheney_buffer, Cheney_ext);
  let Cheney_text;
  if (Cheney_ext === '.pdf') Cheney_text = await Cheney_parsePdf(Cheney_buffer);
  else if (Cheney_ext === '.docx') {
    await Cheney_validateZip(Cheney_buffer, Cheney_ext);
    Cheney_text = await Cheney_parseDocx(Cheney_buffer);
  } else if (Cheney_ext === '.pptx') Cheney_text = await Cheney_parsePptx(Cheney_buffer);
  else Cheney_text = Cheney_parseTxt(Cheney_buffer);
  return Cheney_normalizeText(Cheney_text);
}

/** 在约 700 字范围内优先按段落或句子切分，相邻块保留 80 字重叠 */
function Cheney_splitText(Cheney_text) {
  const Cheney_chunks = [];
  let Cheney_start = 0;
  while (Cheney_start < Cheney_text.length) {
    let Cheney_end = Math.min(Cheney_start + 700, Cheney_text.length);
    if (Cheney_end < Cheney_text.length) {
      const Cheney_window = Cheney_text.slice(Cheney_start, Cheney_end);
      const Cheney_breaks = ['\n\n', '。', '！', '？', '；', '\n']
        .map((Cheney_mark) => Cheney_window.lastIndexOf(Cheney_mark))
        .filter((Cheney_index) => Cheney_index >= 400);
      if (Cheney_breaks.length) Cheney_end = Cheney_start + Math.max(...Cheney_breaks) + 1;
      if (Cheney_text.length - Cheney_end < 100 && Cheney_text.length - Cheney_start <= 850) {
        Cheney_end = Cheney_text.length;
      }
    }
    const Cheney_chunk = Cheney_text.slice(Cheney_start, Cheney_end).trim();
    if (Cheney_chunk) Cheney_chunks.push(Cheney_chunk);
    if (Cheney_end >= Cheney_text.length) break;
    Cheney_start = Math.max(Cheney_end - 80, Cheney_start + 1);
  }
  if (Cheney_chunks.length > 2000) throw Cheney_makeError('文档分块超过 2000 个，请拆分文件后上传');
  return Cheney_chunks;
}

function Cheney_storedPath(Cheney_document) {
  if (path.basename(Cheney_document.Cheney_stored_name) !== Cheney_document.Cheney_stored_name) {
    throw Cheney_makeError('知识库文件存储路径不合法', 500);
  }
  return path.join(Cheney_uploadDir, Cheney_document.Cheney_stored_name);
}

async function Cheney_parseAndStore(Cheney_id, Cheney_filePath, Cheney_ext) {
  try {
    const Cheney_text = await Cheney_extractText(Cheney_filePath, Cheney_ext);
    const Cheney_chunks = Cheney_splitText(Cheney_text);
    await Cheney_knowledgeModel.Cheney_replaceDocumentContent(Cheney_id, Cheney_chunks);
    return Cheney_knowledgeModel.Cheney_findDocumentById(Cheney_id);
  } catch (Cheney_err) {
    await Cheney_knowledgeModel.Cheney_markDocumentFailed(Cheney_id, Cheney_err.message);
    Cheney_err.Cheney_status = Cheney_err.Cheney_status || 400;
    Cheney_err.Cheney_data = { ...Cheney_err.Cheney_data, cheney_id: Cheney_id };
    throw Cheney_err;
  }
}

async function Cheney_importFile(Cheney_file) {
  const Cheney_ext = path.extname(Cheney_file.originalname).toLowerCase();
  try {
    const Cheney_buffer = await fsp.readFile(Cheney_file.path);
    Cheney_assertSignature(Cheney_buffer, Cheney_ext);
    if (['.docx', '.pptx'].includes(Cheney_ext)) await Cheney_validateZip(Cheney_buffer, Cheney_ext);
    const Cheney_sha256 = crypto.createHash('sha256').update(Cheney_buffer).digest('hex');
    const Cheney_id = await Cheney_knowledgeModel.Cheney_createDocument({
      Cheney_original_name: path.basename(Cheney_file.originalname).slice(0, 255),
      Cheney_stored_name: Cheney_file.filename,
      Cheney_file_path: path.relative(Cheney_backendDir, Cheney_file.path).replace(/\\/g, '/'),
      Cheney_extension: Cheney_ext.slice(1),
      Cheney_mime: Cheney_file.mimetype,
      Cheney_size: Cheney_file.size,
      Cheney_sha256
    });
    return await Cheney_parseAndStore(Cheney_id, Cheney_file.path, Cheney_ext);
  } catch (Cheney_err) {
    if (!Cheney_err.Cheney_data || !Cheney_err.Cheney_data.cheney_id) {
      await fsp.unlink(Cheney_file.path).catch(() => {});
    }
    throw Cheney_err;
  }
}

async function Cheney_rebuildFile(Cheney_id) {
  const Cheney_document = await Cheney_knowledgeModel.Cheney_findDocumentById(Cheney_id);
  if (!Cheney_document) throw Cheney_makeError('知识库文件不存在', 404);
  const Cheney_filePath = Cheney_storedPath(Cheney_document);
  try {
    await fsp.access(Cheney_filePath);
  } catch (Cheney_err) {
    throw Cheney_makeError('原始文件已丢失，无法重新解析，请重新上传', 404);
  }
  return Cheney_parseAndStore(Cheney_id, Cheney_filePath, `.${Cheney_document.Cheney_extension}`);
}

async function Cheney_removeFile(Cheney_id) {
  const Cheney_document = await Cheney_knowledgeModel.Cheney_findDocumentById(Cheney_id);
  if (!Cheney_document) throw Cheney_makeError('知识库文件不存在', 404);
  const Cheney_filePath = Cheney_storedPath(Cheney_document);
  await Cheney_knowledgeModel.Cheney_deleteDocument(Cheney_id);
  await fsp.unlink(Cheney_filePath).catch((Cheney_err) => {
    if (Cheney_err.code !== 'ENOENT') console.error('知识库原文件清理失败：', Cheney_err.message);
  });
}

module.exports = {
  Cheney_uploadMiddleware,
  Cheney_importFile,
  Cheney_rebuildFile,
  Cheney_removeFile,
  Cheney_splitText
};
