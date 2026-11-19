/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：统一 JSON 响应格式 { code, msg, data }，code=0 成功，非 0 失败
 */

function Cheney_ok(data = {}, msg = '操作成功') {
  return { code: 0, msg, data };
}

function Cheney_fail(msg = '操作失败', code = 1, data = {}) {
  return { code, msg, data };
}

module.exports = { Cheney_ok, Cheney_fail };