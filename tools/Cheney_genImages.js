/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：生成 frontend/images 下的本地 SVG 配图（新闻封面 10 张 + 图文列表 10 张）
 * 用法：node tools/Cheney_genImages.js
 */
const fs = require('fs');
const path = require('path');

const Cheney_outDir = path.join(__dirname, '..', 'frontend', 'images');

const Cheney_items = [
  // [文件名, 主标题, 副标题, 深色, 浅色, 装饰风格]
  ['Cheney_news_chip.svg', '3nm 智驾芯片', 'CHIP · 512 TOPS', '#0b1a4a', '#1e6bff', 'pins'],
  ['Cheney_news_ai.svg', '大模型推理框架', 'LLM INFERENCE 2.0', '#2a0b4a', '#a855f7', 'nodes'],
  ['Cheney_news_6g.svg', '6G 通感一体', '100 Gbps · 26 GHz', '#04222b', '#06b6d4', 'waves'],
  ['Cheney_news_os.svg', '鸿蒙原生生态', 'HARMONY NATIVE', '#062a44', '#38bdf8', 'blocks'],
  ['Cheney_news_cloud.svg', '一体化算力网', 'COMPUTING GRID', '#0a1f2e', '#22d3ee', 'grid'],
  ['Cheney_news_battery.svg', '固态电池中试线', '420 Wh/kg', '#10230b', '#4ade80', 'bars'],
  ['Cheney_news_quantum.svg', '量子纠错突破', 'SURFACE CODE d=7', '#1a0f3d', '#818cf8', 'orbits'],
  ['Cheney_news_webgpu.svg', 'WebGPU 渲染', '78 FPS · 4K', '#25130a', '#fb923c', 'triangles'],
  ['Cheney_news_agent.svg', '智能体标准接口', 'AGENT SDK', '#0d1f1a', '#2dd4bf', 'nodes'],
  ['Cheney_news_drone.svg', '低空物流常态化', 'UAV LOGISTICS', '#101a3a', '#60a5fa', 'waves'],
  ['Cheney_gallery_1.svg', '晶圆厂无灯车间', '12 英寸 · 自动化搬运', '#0b1430', '#3b82f6', 'grid'],
  ['Cheney_gallery_2.svg', '液冷数据中心', 'PUE 1.15', '#052e2b', '#14b8a6', 'bars'],
  ['Cheney_gallery_3.svg', '低空配送航线', '18 分钟送达', '#131f3c', '#818cf8', 'waves'],
  ['Cheney_gallery_4.svg', '固态电池产线', '叠片 · 热压 · 干燥房', '#14230c', '#65a30d', 'bars'],
  ['Cheney_gallery_5.svg', '量子计算低温机柜', '10 毫开尔文', '#180d36', '#a78bfa', 'orbits'],
  ['Cheney_gallery_6.svg', '鸿蒙多设备协同', '延迟 < 40 ms', '#082945', '#22d3ee', 'blocks'],
  ['Cheney_gallery_7.svg', '6G 通感基站', '26 GHz 阵列天线', '#04222b', '#2dd4bf', 'waves'],
  ['Cheney_gallery_8.svg', '山区光伏矩阵', '双轴跟踪 +21%', '#2b2105', '#facc15', 'triangles'],
  ['Cheney_gallery_9.svg', '数字孪生大屏', '3 秒异常告警', '#0a1f2e', '#38bdf8', 'grid'],
  ['Cheney_gallery_10.svg', '夜间自动驾驶测试', '识别 120 米小目标', '#1b1030', '#f472b6', 'nodes']
];

/** 根据风格生成装饰图形 */
function Cheney_decor(style, Cheney_light) {
  const Cheney_op = (o) => `fill="${Cheney_light}" fill-opacity="${o}"`;
  switch (style) {
    case 'grid':
      return Array.from({ length: 9 }, (_, i) => `<rect x="${60 + i * 78}" y="300" width="2" height="150" ${Cheney_op(0.18)} />`).join('') +
        Array.from({ length: 5 }, (_, i) => `<rect x="60" y="${300 + i * 36}" width="700" height="1.5" ${Cheney_op(0.14)} />`).join('');
    case 'bars':
      return Array.from({ length: 7 }, (_, i) => `<rect x="${80 + i * 96}" y="${330 - i * 22}" width="46" height="${60 + i * 22}" rx="8" ${Cheney_op(0.24 + i * 0.03)} />`).join('');
    case 'waves':
      return Array.from({ length: 4 }, (_, i) => `<path d="M40 ${250 + i * 45} Q 200 ${190 + i * 45} 360 ${250 + i * 45} T 680 ${250 + i * 45} T 1000 ${250 + i * 45}" fill="none" stroke="${Cheney_light}" stroke-opacity="${0.35 - i * 0.06}" stroke-width="2.5" />`).join('');
    case 'nodes':
      return `<circle cx="640" cy="180" r="70" ${Cheney_op(0.16)} /><circle cx="740" cy="330" r="120" ${Cheney_op(0.1)} /><circle cx="560" cy="380" r="46" ${Cheney_op(0.2)} />` +
        `<path d="M640 180 L740 330 L560 380 Z" fill="none" stroke="${Cheney_light}" stroke-opacity="0.35" stroke-width="2" />`;
    case 'orbits':
      return Array.from({ length: 4 }, (_, i) => `<ellipse cx="700" cy="240" rx="${70 + i * 55}" ry="${28 + i * 26}" fill="none" stroke="${Cheney_light}" stroke-opacity="${0.4 - i * 0.07}" stroke-width="2" transform="rotate(${-18 - i * 9} 700 240)" />`).join('') +
        `<circle cx="700" cy="240" r="16" ${Cheney_op(0.75)} />`;
    case 'triangles':
      return Array.from({ length: 5 }, (_, i) => `<path d="M${120 + i * 130} ${400} L${170 + i * 130} ${300 - i * 14} L${220 + i * 130} 400 Z" ${Cheney_op(0.2 + i * 0.04)} />`).join('');
    case 'blocks':
      return Array.from({ length: 6 }, (_, i) => `<rect x="${560 + (i % 3) * 86}" y="${150 + Math.floor(i / 3) * 92}" width="70" height="70" rx="16" ${Cheney_op(0.18 + (i % 3) * 0.08)} />`).join('');
    case 'pins':
      return Array.from({ length: 14 }, (_, i) => `<rect x="${520 + (i % 7) * 26}" y="${300 + Math.floor(i / 7) * 120}" width="12" height="70" rx="6" ${Cheney_op(0.3)} />`).join('') +
        `<rect x="140" y="330" width="330" height="150" rx="18" fill="none" stroke="${Cheney_light}" stroke-opacity="0.35" stroke-width="2.5" />`;
    default:
      return '';
  }
}

function Cheney_svg([, title, sub, dark, light, style]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="Cheney_bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${dark}" />
      <stop offset="100%" stop-color="${light}" stop-opacity="0.85" />
    </linearGradient>
    <radialGradient id="Cheney_glow" cx="0.8" cy="0.15" r="0.75">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="url(#Cheney_bg)" />
  <rect width="800" height="500" fill="url(#Cheney_glow)" />
  ${Cheney_decor(style, light)}
  <g font-family="Microsoft YaHei, PingFang SC, sans-serif">
    <text x="60" y="150" fill="#ffffff" font-size="42" font-weight="700">${title}</text>
    <text x="60" y="196" fill="#ffffff" fill-opacity="0.72" font-size="20" letter-spacing="3">${sub}</text>
    <text x="60" y="452" fill="#ffffff" fill-opacity="0.5" font-size="16" letter-spacing="2">张硕 · 24006380115 · 星穹科技资讯站</text>
  </g>
</svg>`;
}

fs.mkdirSync(Cheney_outDir, { recursive: true });
Cheney_items.forEach((Cheney_item) => {
  fs.writeFileSync(path.join(Cheney_outDir, Cheney_item[0]), Cheney_svg(Cheney_item), 'utf8');
});
console.log(`已生成 ${Cheney_items.length} 张 SVG 配图 -> ${Cheney_outDir}`);