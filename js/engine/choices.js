/* =====================================================================
   DELTAMETHRIN — 선택지와 집단의 간섭
   mode
     normal      간섭 없음
     reconfirm   B 위에 경고 문구 + B 선택 시 재확인 팝업      (선택 05)
     repeat      B를 4번 눌러야 진행, 3번째에 화면 지지직     (선택 06)
     crowdHover  B 위에 군중 말풍선                           (선택 08)
     shrink      B를 누르면 A가 커지고 B가 사라짐 + 눈        (선택 11)
     papers      두 장의 종이, 같은 의미                      (선택 14)
     distort     B 문구 왜곡 + 재확인                          (선택 15)
     final       3단 팝업 → 어머님의 얼굴 → A로 뒤덮임         (선택 19)
   ===================================================================== */
const Choices = {
  async run(cmd) {
    UI.hideDialog();
    const box = $('#choices'), list = $('#chList'), narr = $('#chNarr'), hint = $('#hoverHint');
    box.className = cmd.mode === 'papers' ? 'papers' : '';
    $('#chTitle').textContent = `선택 ${cmd.id.slice(1)}${cmd.title ? ' — ' + cmd.title : ''}`;
    narr.textContent = ''; narr.className = 'ch-narr';
    const mk = (key, text) => `<button class="opt" data-k="${key}"><span class="key">${key}</span><span class="tx">${esc(text)}</span></button>`;
    list.innerHTML = mk('A', cmd.a) + mk('B', cmd.b);
    box.classList.remove('hidden');
    const btnA = list.querySelector('[data-k=A]'), btnB = list.querySelector('[data-k=B]');
    const bubbles = document.createElement('div'); bubbles.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    box.appendChild(bubbles);

    let resolveFn, busy = false, clicksB = 0;
    const result = new Promise(r => resolveFn = r);
    const finish = (key, conform) => {
      Input.pop(ctx); box.classList.add('hidden'); hint.classList.remove('on'); bubbles.remove();
      list.innerHTML = '';
      Game.choose(cmd.id, key, conform);
      Game.pushLog('', `${cmd.id.toUpperCase()} · ${key === 'A' ? cmd.a : cmd.b}`, 'choice');
      Audio2.sfx('confirm');
      resolveFn(key);
    };

    // ---- 마우스 올림 / 포커스 효과 ----
    const hoverOn = () => {
      if (cmd.mode === 'reconfirm' && cmd.hoverB) { hint.textContent = cmd.hoverB; hint.classList.add('on'); }
      if (cmd.mode === 'crowdHover' && !bubbles.childElementCount) {
        const pos = [[3, 8], [70, 12], [6, 70], [72, 66], [38, 4]];
        cmd.hoverBubbles.forEach((t, k) => setTimeout(() => {
          if (!btnB.matches(':hover') && !btnB.classList.contains('focus')) return;
          const b = document.createElement('div'); b.className = 'wb red';
          b.style.left = pos[k][0] + '%'; b.style.top = pos[k][1] + '%'; b.textContent = t;
          bubbles.appendChild(b); Audio2.sfx('whisper');
        }, k * 420));
      }
      if (cmd.mode === 'distort') { btnB.querySelector('.tx').textContent = cmd.distortB; Audio2.sfx('glitch'); }
    };
    const hoverOff = () => {
      hint.classList.remove('on');
      if (cmd.mode === 'crowdHover') bubbles.innerHTML = '';
      if (cmd.mode === 'distort') btnB.querySelector('.tx').textContent = cmd.b;
    };
    btnB.addEventListener('mouseenter', hoverOn);
    btnB.addEventListener('mouseleave', hoverOff);

    // ---- 선택 처리 ----
    const pickA = () => { if (busy) return; finish('A', cmd.mode === 'papers' ? null : true); };
    const pickB = async () => {
      if (busy) return;
      switch (cmd.mode) {
        case 'reconfirm': {
          busy = true; hoverOff();
          const ok = await UI.popup(cmd.confirms[0]);
          busy = false;
          if (ok) finish('B', false);
          return;
        }
        case 'repeat': {
          clicksB++;
          const step = cmd.repeatB[clicksB - 1];
          if (clicksB >= 4) { $('#game').classList.remove('glitch'); finish('B', false); return; }
          if (step === '__glitch__') { narr.textContent = ''; $('#game').classList.add('glitch'); Audio2.sfx('glitch'); setTimeout(() => Audio2.sfx('glitch'), 350); }
          else { narr.textContent = step; narr.classList.add('red'); Audio2.sfx('warn'); }
          return;
        }
        case 'shrink': {
          busy = true; Game.s.tried[cmd.id] = true;
          Audio2.sfx('whisper');
          let k = 0;
          await new Promise(r => {
            const iv = setInterval(() => {
              k++;
              btnA.style.transform = `scale(${1 + k * .045})`; btnA.style.fontSize = (21 + k * .7) + 'px';
              btnB.style.opacity = Math.max(0, 1 - k / 12); btnB.style.transform = `scale(${1 - k * .03})`;
              if (k % 3 === 0) Audio2.sfx('whisper');
              if (k >= 12) { clearInterval(iv); r(); }
            }, 160);
          });
          btnB.classList.add('gone'); btnB.style.visibility = 'hidden';
          await this.eyes();
          btnB.remove(); btnA.style.transform = 'scale(1.35)';
          busy = false;
          ctx.nav.reset(); ctx.nav.focus(0);
          return;
        }
        case 'distort': {
          busy = true; hoverOff();
          const ok = await UI.popup(cmd.confirms[0]);
          busy = false;
          if (ok) finish('B', false);
          return;
        }
        case 'final': {
          busy = true;
          for (let k = 0; k < cmd.confirms.length; k++) {
            if (k === 2) { $('#game').classList.add('glitch'); Audio2.sfx('glitch'); }
            const ok = await UI.popup(cmd.confirms[k]);
            if (!ok) { $('#game').classList.remove('glitch'); busy = false; return; }
          }
          Game.s.tried[cmd.id] = true;
          await sleep(500);
          $('#game').classList.remove('glitch');
          await this.motherFace();
          // 선택지 재등장: B는 없고 A로 뒤덮임
          box.classList.add('flood');
          list.innerHTML = Array.from({ length: 12 }, () => mk('A', cmd.a)).join('');
          list.querySelectorAll('.opt').forEach(b => { b.classList.add('fill'); b.onclick = pickA; });
          narr.textContent = '';
          busy = false;
          ctx.nav.reset(); ctx.nav.focus(0);
          return;
        }
        case 'papers': finish('B', null); return;
        default: finish('B', false);
      }
    };
    btnA.onclick = pickA; btnB.onclick = pickB;

    const ctx = Input.push({
      name: 'choice', saveable: true,
      key: e => ctx.nav.key(e)
    });
    let lastFocus = null;
    ctx.nav = navList(() => $$('#chList .opt'), {
      axis: cmd.mode === 'papers' ? 'x' : 'y',
      onFocus: b => {
        if (lastFocus === btnB && b !== btnB) hoverOff();
        if (b === btnB) hoverOn();
        lastFocus = b;
      }
    });
    return result;
  },

  async eyes() {
    const el = $('#eyes'); el.innerHTML = ''; el.classList.remove('hidden');
    const spots = [[2, 4, 1.2], [78, 2, 1], [86, 46, 1.3], [0, 52, 1.1], [30, 0, .8], [56, 6, .9], [12, 26, .9], [70, 24, 1], [44, 62, .8], [90, 74, .9], [4, 80, 1]];
    Audio2.sfx('thud'); Audio2.sfx('glitch');
    if (Game.settings.fx) UI.fx('shake');
    spots.forEach(([x, y, s], k) => {
      const d = document.createElement('div'); d.className = 'eye';
      d.style.left = x + '%'; d.style.top = y + '%'; d.style.width = (220 * s) + 'px'; d.style.animationDelay = (k * .03) + 's';
      d.innerHTML = ART.eye(1, k % 4 === 0);
      el.appendChild(d);
    });
    await sleep(1700);
    el.style.transition = 'opacity .6s'; el.style.opacity = 0;
    await sleep(600); el.classList.add('hidden'); el.style.opacity = 1; el.style.transition = ''; el.innerHTML = '';
  },

  async motherFace() {
    const el = $('#bigFace');
    el.innerHTML = UI.art('img', 'mother_face'); el.classList.remove('hidden');
    Audio2.sfx('thud');
    if (Game.settings.fx) UI.fx('shake');
    await sleep(1200);
    el.innerHTML = UI.art('img', 'mother_face_smile');
    Audio2.sfx('wing');
    await sleep(1600);
    el.classList.add('hidden'); el.innerHTML = '';
  }
};
