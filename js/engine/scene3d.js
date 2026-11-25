/* =====================================================================
   DELTAMETHRIN — 3D 1인칭 장면 (선택 20 · 델타메트린)
   CSS 3D 변환으로 만든 성당 홀. 간섭 요소는 하나도 없습니다.
   ↑ 앞으로 · ← → 돌아보기. 앞에는 어머님, 오른쪽 벽에는 바깥으로 나가는 문.
   바깥 문은 결국 어머님 앞으로 이어집니다 (결정 사항 1-가).
   ===================================================================== */
const Scene3D = {
  run(cmd) {
    return new Promise(resolve => {
      UI.hideDialog(); UI.clearChars();
      const root = $('#fp'), world = $('#fpWorld'), text = $('#fpText');
      root.classList.remove('hidden');
      const EYE = 170, W = 1600, Z0 = 300, Z1 = -2300;
      const MOTHER = { x: 0, z: -1750 };
      const DOOR = { z: -760 };
      const cam = { x: 0, z: 120, yaw: 0 };
      const keys = {};
      let looped = !!Game.s.flags.triedOutside, busy = false, ended = false, raf, last = performance.now(), stepT = 0;

      const wallSvg = (w, h, opts = {}) => {
        let cols = '';
        for (let x = 100; x < w; x += 360) cols += `<rect x="${x}" y="0" width="70" height="${h}" fill="#dfe5e9" stroke="#141414" stroke-width="4" filter="url(#rough)"/><rect x="${x + 46}" y="0" width="24" height="${h}" fill="url(#hatch)"/>`;
        const door = opts.door ? `<g filter="url(#rough)"><path d="M${opts.door - 130} ${h} L${opts.door - 130} ${h - 380} A130 130 0 0 1 ${opts.door + 130} ${h - 380} L${opts.door + 130} ${h}Z" fill="#fbfdfe" stroke="#141414" stroke-width="8"/>
          <rect x="${opts.door - 130}" y="${h - 510}" width="260" height="510" fill="#fff" opacity=".6" filter="url(#smudge)"/></g>` : '';
        return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><rect width="${w}" height="${h}" fill="#cfd6db"/>
          <rect width="${w}" height="${h}" fill="url(#hatch)" opacity=".35"/>${cols}${door}</svg>`;
      };
      const plane = (w, h, tf, html, extra = '') => `<div class="plane" style="width:${w}px;height:${h}px;margin:${-h / 2}px 0 0 ${-w / 2}px;transform:${tf};${extra}">${html}</div>`;
      const D = Z0 - Z1, HZ = (Z0 + Z1) / 2, H = 760;
      const build = () => {
        world.innerHTML =
          // 바닥
          plane(W, D, `translate3d(0px, ${EYE}px, ${HZ}px) rotateX(90deg)`, `<svg viewBox="0 0 10 10" preserveAspectRatio="none"><rect width="10" height="10" fill="#b9bfc4"/><rect width="10" height="10" fill="url(#hatchD)" opacity=".25"/></svg>`)
          // 천장
          + plane(W, D, `translate3d(0px, ${EYE - H}px, ${HZ}px) rotateX(-90deg)`, `<svg viewBox="0 0 10 10" preserveAspectRatio="none"><rect width="10" height="10" fill="#9aa1a7"/></svg>`)
          // 왼쪽 벽 (성당 안쪽)
          + plane(D, H, `translate3d(${-W / 2}px, ${EYE - H / 2}px, ${HZ}px) rotateY(90deg)`, wallSvg(D, H))
          // 오른쪽 벽 (바깥 문)
          + plane(D, H, `translate3d(${W / 2}px, ${EYE - H / 2}px, ${HZ}px) rotateY(-90deg)`, wallSvg(D, H, looped ? {} : { door: (DOOR.z - Z1) }))
          // 뒤쪽 벽 (빛)
          + plane(W, H, `translate3d(0px, ${EYE - H / 2}px, ${Z1}px)`, `<svg viewBox="0 0 1600 760" preserveAspectRatio="none"><rect width="1600" height="760" fill="#f5f9fb"/><circle cx="800" cy="330" r="560" fill="url(#sunGlow)"/><circle cx="800" cy="330" r="200" fill="#fff"/></svg>`)
          // 등 뒤 벽
          + plane(W, H, `translate3d(0px, ${EYE - H / 2}px, ${Z0}px) rotateY(180deg)`, wallSvg(W, H))
          // 어머님 (역광 실루엣)
          + `<div class="plane" id="fpMother" style="width:520px;height:760px;margin:-760px 0 0 -260px;">${ART.ch('mother_silhouette')}</div>`;
      };
      build();
      const mother = () => $('#fpMother');

      const render = () => {
        world.style.transform = `translateZ(700px) rotateY(${cam.yaw}rad) translate3d(${-cam.x}px, 0px, ${-cam.z}px)`;
        const m = mother(); if (m) m.style.transform = `translate3d(${MOTHER.x}px, ${EYE}px, ${MOTHER.z}px) rotateY(${-cam.yaw}rad)`;
      };
      const say = async (lines, gap = 2300) => {
        for (const l of lines) {
          if (ended) return;
          text.style.opacity = 0; await sleep(300);
          text.textContent = l; text.style.opacity = 1;
          Game.pushLog('', l, 'narr');
          await sleep(gap);
        }
        text.style.opacity = 0;
      };

      const outside = async () => {
        busy = true; looped = true; Game.s.flags.triedOutside = true; Game.s.tried.c20 = true;
        Object.keys(keys).forEach(k => keys[k] = false);
        Audio2.sfx('door');
        const view = $('#fpView'); view.style.transition = 'opacity .9s'; view.style.opacity = 0;
        await sleep(900);
        text.style.color = '#141414';
        const steps = setInterval(() => Audio2.sfx('step3d'), 520);
        await say(cmd.outsideLoop.slice(0, -1), 2500);
        clearInterval(steps);
        // 다시 어머님 앞으로
        cam.x = 0; cam.z = -1150; cam.yaw = 0; build(); render();
        view.style.opacity = 1;
        await sleep(900);
        await say(cmd.outsideLoop.slice(-1), 2600);
        busy = false;
      };

      const finish = async () => {
        ended = true; cancelAnimationFrame(raf);
        Input.pop(ctx);
        root.removeEventListener('pointerdown', pdown); window.removeEventListener('pointerup', pup);
        Game.choose('c20', 'A', null);
        Game.pushLog('', 'C20 · 어머님의 품에 안긴다.', 'choice');
        Audio2.sfx('wing');
        const f = $('#fade'); f.classList.add('white', 'on');
        await sleep(1600);
        root.classList.add('hidden'); world.innerHTML = ''; $('#fpView').style.opacity = 1; text.textContent = '';
        $('#grain').style.opacity = ''; $('#vignette').style.opacity = '';
        f.classList.remove('on'); await sleep(400); f.classList.remove('white');
        resolve();
      };

      const tick = t => {
        const dt = Math.min(50, t - last) / 1000; last = t;
        if (!busy) {
          let moving = false;
          if (keys.left) cam.yaw -= 1.5 * dt;
          if (keys.right) cam.yaw += 1.5 * dt;
          if (keys.up) {
            const sp = 260 * dt;
            cam.x += Math.sin(cam.yaw) * sp; cam.z -= Math.cos(cam.yaw) * sp;
            cam.x = Math.max(-W / 2 + 90, Math.min(W / 2 - 90, cam.x));
            cam.z = Math.max(Z1 + 120, Math.min(Z0 - 80, cam.z));
            moving = true;
            stepT += dt; if (stepT > .5) { stepT = 0; Audio2.sfx('step3d'); }
          }
          root.classList.toggle('walk', moving);
          if (Math.hypot(cam.x - MOTHER.x, cam.z - MOTHER.z) < 300) { finish(); return; }
          if (!looped && cam.x > W / 2 - 240 && Math.abs(cam.z - DOOR.z) < 200) outside();
        }
        render();
        raf = requestAnimationFrame(tick);
      };

      const map = { ArrowUp: 'up', KeyW: 'up', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
      const ctx = Input.push({
        name: 'fp3d', allowRepeat: true,
        key: e => { if (map[e.code]) { keys[map[e.code]] = true; return true; } return e.code !== 'Escape'; },
        keyup: e => { if (map[e.code]) keys[map[e.code]] = false; }
      });
      // 마우스: 화면 왼쪽/오른쪽 1/4 은 돌아보기, 가운데는 걷기
      const pdown = e => {
        const r = root.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
        if (x < .25) keys.left = true; else if (x > .75) keys.right = true; else keys.up = true;
      };
      const pup = () => { keys.left = keys.right = keys.up = false; };
      root.addEventListener('pointerdown', pdown); window.addEventListener('pointerup', pup);

      render();
      raf = requestAnimationFrame(tick);
      text.style.color = '';
      say(cmd.intro, 2800);
    });
  }
};
