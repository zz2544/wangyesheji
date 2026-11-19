/**
 * 姓名：张硕 | 学号：24006380115 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 作用：首页 canvas 背景动画（星轨粒子 + 连线 + 缓慢漂浮）
 */
(function Cheney_indexCanvas() {
  const Cheney_canvas = document.getElementById('Cheney_canvas');
  if (!Cheney_canvas) {
    console.error('[Cheney] 未找到 #Cheney_canvas，动画未启动');
    return;
  }

  const Cheney_ctx = Cheney_canvas.getContext('2d');
  const Cheney_state = {
    width: 0,
    height: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    particles: [],
    stars: [],
    animationId: null,
    mouse: { x: -999, y: -999 }
  };

  function Cheney_resize() {
    const Cheney_w = window.innerWidth;
    const Cheney_h = window.innerHeight;
    Cheney_state.width = Cheney_w;
    Cheney_state.height = Cheney_h;
    Cheney_canvas.width = Cheney_w * Cheney_state.dpr;
    Cheney_canvas.height = Cheney_h * Cheney_state.dpr;
    Cheney_ctx.setTransform(Cheney_state.dpr, 0, 0, Cheney_state.dpr, 0, 0);
    Cheney_initParticles();
    console.log('[Cheney] canvas 尺寸更新：', Cheney_w, Cheney_h);
  }

  function Cheney_initParticles() {
    const Cheney_area = Cheney_state.width * Cheney_state.height;
    const Cheney_count = Math.max(34, Math.min(90, Math.round(Cheney_area / 16000)));

    Cheney_state.particles = Array.from({ length: Cheney_count }, () => ({
      x: Math.random() * Cheney_state.width,
      y: Math.random() * Cheney_state.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.8 + 0.6
    }));

    Cheney_state.stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * Cheney_state.width,
      y: Math.random() * Cheney_state.height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.5 + 0.15
    }));
  }

  function Cheney_draw() {
    const { width: Cheney_w, height: Cheney_h, particles: Cheney_ps } = Cheney_state;
    Cheney_ctx.clearRect(0, 0, Cheney_w, Cheney_h);

    // 背景星点
    Cheney_state.stars.forEach((Cheney_star) => {
      Cheney_ctx.beginPath();
      Cheney_ctx.arc(Cheney_star.x, Cheney_star.y, Cheney_star.r, 0, Math.PI * 2);
      Cheney_ctx.fillStyle = `rgba(190, 215, 255, ${Cheney_star.a})`;
      Cheney_ctx.fill();
    });

    // 粒子运动
    Cheney_ps.forEach((Cheney_p) => {
      Cheney_p.x += Cheney_p.vx;
      Cheney_p.y += Cheney_p.vy;

      if (Cheney_p.x < -20) Cheney_p.x = Cheney_w + 20;
      if (Cheney_p.x > Cheney_w + 20) Cheney_p.x = -20;
      if (Cheney_p.y < -20) Cheney_p.y = Cheney_h + 20;
      if (Cheney_p.y > Cheney_h + 20) Cheney_p.y = -20;

      // 鼠标吸引力
      const Cheney_dx = Cheney_state.mouse.x - Cheney_p.x;
      const Cheney_dy = Cheney_state.mouse.y - Cheney_p.y;
      const Cheney_dist = Math.hypot(Cheney_dx, Cheney_dy);
      if (Cheney_dist < 160 && Cheney_dist > 0.001) {
        Cheney_p.vx += (Cheney_dx / Cheney_dist) * 0.012;
        Cheney_p.vy += (Cheney_dy / Cheney_dist) * 0.012;
      }
      Cheney_p.vx *= 0.994;
      Cheney_p.vy *= 0.994;
      const Cheney_speed = Math.hypot(Cheney_p.vx, Cheney_p.vy);
      if (Cheney_speed < 0.06) {
        Cheney_p.vx += (Math.random() - 0.5) * 0.05;
        Cheney_p.vy += (Math.random() - 0.5) * 0.05;
      }

      Cheney_ctx.beginPath();
      Cheney_ctx.arc(Cheney_p.x, Cheney_p.y, Cheney_p.r, 0, Math.PI * 2);
      Cheney_ctx.fillStyle = 'rgba(140, 200, 255, 0.85)';
      Cheney_ctx.fill();
    });

    // 粒子之间的连线
    for (let Cheney_i = 0; Cheney_i < Cheney_ps.length; Cheney_i += 1) {
      for (let Cheney_j = Cheney_i + 1; Cheney_j < Cheney_ps.length; Cheney_j += 1) {
        const Cheney_a = Cheney_ps[Cheney_i];
        const Cheney_b = Cheney_ps[Cheney_j];
        const Cheney_d = Math.hypot(Cheney_a.x - Cheney_b.x, Cheney_a.y - Cheney_b.y);
        if (Cheney_d < 132) {
          const Cheney_alpha = (1 - Cheney_d / 132) * 0.42;
          Cheney_ctx.beginPath();
          Cheney_ctx.moveTo(Cheney_a.x, Cheney_a.y);
          Cheney_ctx.lineTo(Cheney_b.x, Cheney_b.y);
          Cheney_ctx.strokeStyle = `rgba(110, 170, 255, ${Cheney_alpha})`;
          Cheney_ctx.lineWidth = 0.9;
          Cheney_ctx.stroke();
        }
      }
    }

    // 鼠标与附近粒子的连线
    Cheney_ps.forEach((Cheney_p) => {
      const Cheney_d = Math.hypot(Cheney_p.x - Cheney_state.mouse.x, Cheney_p.y - Cheney_state.mouse.y);
      if (Cheney_d < 180) {
        Cheney_ctx.beginPath();
        Cheney_ctx.moveTo(Cheney_p.x, Cheney_p.y);
        Cheney_ctx.lineTo(Cheney_state.mouse.x, Cheney_state.mouse.y);
        Cheney_ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - Cheney_d / 180) * 0.5})`;
        Cheney_ctx.lineWidth = 1;
        Cheney_ctx.stroke();
      }
    });

    Cheney_state.animationId = requestAnimationFrame(Cheney_draw);
  }

  window.addEventListener('resize', Cheney_resize);
  window.addEventListener('mousemove', (Cheney_e) => {
    Cheney_state.mouse.x = Cheney_e.clientX;
    Cheney_state.mouse.y = Cheney_e.clientY;
  });
  window.addEventListener('mouseout', () => {
    Cheney_state.mouse.x = -999;
    Cheney_state.mouse.y = -999;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(Cheney_state.animationId);
      console.log('[Cheney] 页面隐藏，动画暂停');
    } else {
      Cheney_draw();
      console.log('[Cheney] 页面可见，动画恢复');
    }
  });

  Cheney_resize();
  Cheney_draw();
  console.log('[Cheney] 首页 canvas 背景动画已启动，粒子数：', Cheney_state.particles.length);
})();