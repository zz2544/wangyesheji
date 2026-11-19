/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：启动项目时用 Edge/Chrome 打开页面。Chromium 内核默认把 115 视为不安全端口，
 *       因此必须带 --explicitly-allowed-ports 启动，并使用独立用户目录避免复用已运行实例。
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const Cheney_port = Number(process.env.PORT || 115);
const Cheney_url = `http://127.0.0.1:${Cheney_port}/`;
const Cheney_profile = path.join(process.env.LOCALAPPDATA || os.tmpdir(), 'CheneyEdgeProfile');
const Cheney_candidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
].filter(Boolean);

const Cheney_browser = Cheney_candidates.find((Cheney_file) => fs.existsSync(Cheney_file));
const Cheney_args = [
  `--explicitly-allowed-ports=${Cheney_port}`,
  `--user-data-dir=${Cheney_profile}`,
  '--no-first-run',
  '--no-default-browser-check',
  Cheney_url
];

setTimeout(() => {
  if (!Cheney_browser) {
    console.log('未找到 Edge/Chrome，请手动访问：' + Cheney_url);
    console.log(`若浏览器提示 ERR_UNSAFE_PORT，请加参数：--explicitly-allowed-ports=${Cheney_port}`);
    return;
  }
  try {
    const Cheney_child = spawn(Cheney_browser, Cheney_args, { detached: true, stdio: 'ignore' });
    Cheney_child.unref();
    console.log('已打开浏览器：' + Cheney_url);
    console.log(`（启动参数含 --explicitly-allowed-ports=${Cheney_port}，用于放行 Chromium 的不安全端口限制）`);
  } catch (Cheney_err) {
    console.error('自动打开浏览器失败：', Cheney_err.message);
    console.log('请手动访问：' + Cheney_url);
  }
}, 1500);