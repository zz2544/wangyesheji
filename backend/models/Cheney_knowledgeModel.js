/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-23 | 大模型：Kimi-K3.1-Pro
 * 作用：知识库文档与分块数据访问层（Model）
 */
const { Cheney_pool, Cheney_query } = require('../config/Cheney_db');

/** 创建待解析文档记录 */
async function Cheney_createDocument(Cheney_document) {
  const Cheney_result = await Cheney_query(
    `INSERT INTO Cheney_kb_documents
      (Cheney_original_name, Cheney_stored_name, Cheney_file_path, Cheney_extension,
       Cheney_mime, Cheney_size, Cheney_sha256, Cheney_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'processing')`,
    [
      Cheney_document.Cheney_original_name,
      Cheney_document.Cheney_stored_name,
      Cheney_document.Cheney_file_path,
      Cheney_document.Cheney_extension,
      Cheney_document.Cheney_mime,
      Cheney_document.Cheney_size,
      Cheney_document.Cheney_sha256
    ]
  );
  return Cheney_result.insertId;
}

/** 文档列表，不返回服务器存储路径 */
async function Cheney_findDocuments() {
  return Cheney_query(
    `SELECT Cheney_id, Cheney_original_name, Cheney_extension, Cheney_size,
            Cheney_status, Cheney_error, Cheney_chunk_count,
            Cheney_created_at, Cheney_updated_at
       FROM Cheney_kb_documents
      ORDER BY Cheney_created_at DESC, Cheney_id DESC`
  );
}

/** 按 ID 查询文档 */
async function Cheney_findDocumentById(Cheney_id) {
  const Cheney_rows = await Cheney_query(
    'SELECT * FROM Cheney_kb_documents WHERE Cheney_id = ?',
    [Cheney_id]
  );
  return Cheney_rows[0] || null;
}

/** 查询文档分块 */
async function Cheney_findChunks(Cheney_documentId) {
  return Cheney_query(
    `SELECT Cheney_id, Cheney_document_id, Cheney_chunk_index, Cheney_content
       FROM Cheney_kb_chunks
      WHERE Cheney_document_id = ?
      ORDER BY Cheney_chunk_index ASC`,
    [Cheney_documentId]
  );
}

/** 查询可参与 RAG 的文档块 */
async function Cheney_findReadyChunks(Cheney_documentId) {
  const Cheney_params = [];
  let Cheney_where = "WHERE d.Cheney_status = 'ready'";
  if (Cheney_documentId) {
    Cheney_where += ' AND d.Cheney_id = ?';
    Cheney_params.push(Cheney_documentId);
  }
  return Cheney_query(
    `SELECT c.Cheney_id, c.Cheney_document_id, c.Cheney_chunk_index,
            c.Cheney_content, d.Cheney_original_name
       FROM Cheney_kb_chunks c
       JOIN Cheney_kb_documents d ON d.Cheney_id = c.Cheney_document_id
      ${Cheney_where}
      ORDER BY c.Cheney_document_id, c.Cheney_chunk_index`,
    Cheney_params
  );
}

/** 事务替换解析后的分块 */
async function Cheney_replaceDocumentContent(Cheney_id, Cheney_chunks) {
  const Cheney_conn = await Cheney_pool.getConnection();
  try {
    await Cheney_conn.beginTransaction();
    await Cheney_conn.execute('DELETE FROM Cheney_kb_chunks WHERE Cheney_document_id = ?', [Cheney_id]);
    if (Cheney_chunks.length) {
      const Cheney_values = [];
      const Cheney_rows = Cheney_chunks.map((Cheney_content, Cheney_index) => {
        Cheney_values.push(Cheney_id, Cheney_index + 1, Cheney_content);
        return '(?, ?, ?)';
      });
      await Cheney_conn.execute(
        `INSERT INTO Cheney_kb_chunks
          (Cheney_document_id, Cheney_chunk_index, Cheney_content)
         VALUES ${Cheney_rows.join(',')}`,
        Cheney_values
      );
    }
    await Cheney_conn.execute(
      `UPDATE Cheney_kb_documents
          SET Cheney_status = 'ready', Cheney_error = NULL, Cheney_chunk_count = ?
        WHERE Cheney_id = ?`,
      [Cheney_chunks.length, Cheney_id]
    );
    await Cheney_conn.commit();
  } catch (Cheney_err) {
    await Cheney_conn.rollback();
    throw Cheney_err;
  } finally {
    Cheney_conn.release();
  }
}

/** 记录解析失败原因 */
async function Cheney_markDocumentFailed(Cheney_id, Cheney_error) {
  await Cheney_query(
    `UPDATE Cheney_kb_documents
        SET Cheney_status = 'failed', Cheney_error = ?, Cheney_chunk_count = 0
      WHERE Cheney_id = ?`,
    [String(Cheney_error).slice(0, 2000), Cheney_id]
  );
}

/** 删除文档，分块由外键级联删除 */
async function Cheney_deleteDocument(Cheney_id) {
  await Cheney_query('DELETE FROM Cheney_kb_documents WHERE Cheney_id = ?', [Cheney_id]);
}

module.exports = {
  Cheney_createDocument,
  Cheney_findDocuments,
  Cheney_findDocumentById,
  Cheney_findChunks,
  Cheney_findReadyChunks,
  Cheney_replaceDocumentContent,
  Cheney_markDocumentFailed,
  Cheney_deleteDocument
};
