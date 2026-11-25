/* =====================================================================
   DELTAMETHRIN — 지도 · 포인트 앤 클릭 조사 · 스페이스 바 상호작용
   ===================================================================== */
const Interact = {
  /* ---------- 지도 ---------- */
  map(cmd) {
    return new Promise(resolve => {
      UI.hideDialog();
      const el = $('#map');
      $('#mapArt').innerHTML = ART.map();
      $('#mapHint').textContent = cmd.hint || '';
      $('#mapMsg').textContent = '방향키로 장소를 고르고 Space/Enter로 이동합니다.';
      const ids = Object.keys(MAP_PLACES);
      $('#mapPins').innerHTML = ids.map(id => {
        const p = MAP_PLACES[id];
        return `<button class="pin ${id === cmd.target ? 'target' : ''} ${p.locked ? 'locked' : ''}" data-id="${id}" style="left:${p.x}%;top:${p.y}%">${esc(p.label)}</button>`;
      }).join('');
      el.classList.remove('hidden');
      Audio2.sfx('paper');
      const pick = b => {
        const id = b.dataset.id;
        if (id === cmd.target) {
          Audio2.sfx('steps');
          Input.pop(ctx); el.classList.add('hidden'); resolve(id);
        } else { $('#mapMsg').textContent = MAP_PLACES[id].idle; Audio2.sfx('click'); }
      };
      $$('#mapPins .pin').forEach(b => b.onclick = () => pick(b));
      const startIdx = ids.indexOf(cmd.target);
      const nav = navList(() => $$('#mapPins .pin'), { axis: 'x', start: startIdx, onPick: pick });
      const ctx = Input.push({ name: 'map', saveable: true, key: e => nav.key(e) });
    });
  },

  /* ---------- 조사 ---------- */
  investigate(cmd) {
    const done = id => !!Game.s.inspected[`${cmd.id}.${id}`];
    const required = cmd.required;
    if (required.every(done)) return Promise.resolve(-1);
    return new Promise(resolve => {
      UI.hideDialog();
      const el = $('#investigate');
      const n = required.filter(done).length;
      el.innerHTML = cmd.spots.map((s, k) => `<button class="spot ${done(s.id) ? 'done' : ''}" data-k="${k}" style="left:${s.x}%;top:${s.y}%;width:${s.w}%;height:${s.h}%"><span>${esc(s.label)}</span></button>`).join('')
        + `<div class="inv-progress">조사한 단서 ${n} / ${required.length} · 마우스 또는 방향키로 살펴보기</div>`;
      el.classList.remove('hidden');
      const pick = b => {
        Audio2.sfx('click');
        Input.pop(ctx); el.classList.add('hidden'); el.innerHTML = '';
        resolve(+b.dataset.k);
      };
      $$('#investigate .spot').forEach(b => b.onclick = () => pick(b));
      const nav = navList(() => $$('#investigate .spot'), { axis: 'x', onPick: pick });
      const ctx = Input.push({ name: 'investigate', saveable: true, key: e => nav.key(e) });
    });
  },

  /* ---------- 스페이스 바 한 번 ---------- */
  press(cmd) {
    return new Promise(resolve => {
      UI.hideDialog();
      const el = $('#hold');
      el.className = 'overlay'; $('#holdArt').innerHTML = ''; $('#holdBubbles').innerHTML = '';
      $('#holdLabel').textContent = cmd.label; $('#holdFill').parentElement.style.display = 'none';
      const go = () => { Input.pop(ctx); el.removeEventListener('pointerdown', go); el.classList.add('hidden'); $('#holdFill').parentElement.style.display = ''; resolve(); };
      const ctx = Input.push({ name: 'press', key: e => { if (e.code === 'Space' || e.code === 'Enter') { go(); return true; } return false; } });
      el.addEventListener('pointerdown', go);
    });
  },

  /* ---------- 스페이스 바 꾹 누르기 ---------- */
  hold(cmd) {
    return new Promise(resolve => {
      UI.hideDialog();
      const el = $('#hold'), fill = $('#holdFill'), art = $('#holdArt'), bub = $('#holdBubbles');
      el.className = cmd.art === 'lock' ? 'overlay' : '';
      $('#holdLabel').textContent = cmd.label;
      bub.innerHTML = '';
      if (cmd.art === 'raise') art.innerHTML = this.raiseArt();
      else if (cmd.art === 'lock') art.innerHTML = `<div style="position:absolute;left:50%;top:44%;width:520px;height:390px;transform:translate(-50%,-50%);border:3px solid #141414;box-shadow:10px 10px 0 #000;background:#ebe8e1" id="lockArt">${UI.art('img', 'box_zoom')}</div>`;
      else art.innerHTML = '';
      const arm = art.querySelector('#arm');
      let p = 0, holding = false, last = performance.now(), raf, voice = 0, finished = false;
      const ms = cmd.ms || 3000;
      const render = () => {
        fill.style.width = (p * 100) + '%';
        if (arm) arm.setAttribute('transform', `rotate(${-8 - p * 150} 0 0)`);
        const la = art.querySelector('#lockArt'); if (la) la.style.transform = `translate(-50%,-50%) rotate(${Math.sin(p * 40) * p * 1.5}deg)`;
      };
      const frame = t => {
        const dt = t - last; last = t;
        if (holding) p = Math.min(1, p + dt / ms); else p = Math.max(0, p - dt / (ms * .35));
        render();
        if (holding && Math.random() < .05) Audio2.sfx('hold');
        if (p >= 1 && !finished) { finished = true; return complete(); }
        raf = requestAnimationFrame(frame);
      };
      const release = () => {
        if (!holding) return; holding = false;
        if (cmd.voices && p < 1) {
          const v = cmd.voices[voice % cmd.voices.length]; voice++;
          const b = document.createElement('div'); b.className = 'wb';
          const spots = [[8, 14], [64, 10], [30, 30], [70, 36], [4, 40], [46, 6]];
          const sp = spots[(voice - 1) % spots.length];
          b.style.left = sp[0] + '%'; b.style.top = sp[1] + '%'; b.style.fontSize = (17 + Math.min(voice, 6) * 1.5) + 'px';
          b.innerHTML = `<b>주민</b>${esc(v)}`; bub.appendChild(b); Audio2.sfx('whisper');
          Game.pushLog('주민', v, 'whisper');
        }
      };
      const complete = async () => {
        cancelAnimationFrame(raf);
        Input.pop(ctx); el.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up);
        Audio2.sfx(cmd.art === 'lock' ? 'click' : 'thud');
        if (cmd.id) { Game.choose(cmd.id, 'A', true); Game.pushLog('', `${cmd.id.toUpperCase()} · 손을 들었다.`, 'choice'); }
        await sleep(cmd.art === 'raise' ? 1200 : 300);
        el.classList.add('hidden'); art.innerHTML = ''; bub.innerHTML = ''; fill.style.width = 0;
        resolve();
      };
      const down = e => { e.preventDefault(); holding = true; };
      const up = () => release();
      const ctx = Input.push({
        name: 'hold', allowRepeat: true,
        key: e => { if (e.code === 'Space' || e.code === 'Enter') { holding = true; return true; } return false; },
        keyup: e => { if (e.code === 'Space' || e.code === 'Enter') release(); }
      });
      el.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      el.classList.remove('hidden');
      raf = requestAnimationFrame(frame);
    });
  },

  // 강당에서 뒤돌아본 사람들 + 차비의 뒷모습과 팔
  raiseArt() {
    return `<div style="position:absolute;inset:0">${UI.art('bg', 'hall_turned')}</div>
      <svg viewBox="0 0 1280 720" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="xMidYMax meet">
        <g filter="url(#rough)">
          <g transform="translate(720 600)"><g id="arm" transform="rotate(-8 0 0)">
            <path d="M0 0 L0 -190" stroke="#f2f1ec" stroke-width="34" stroke-linecap="round"/>
            <path d="M0 0 L0 -190" stroke="#141414" stroke-width="3" fill="none" stroke-dasharray="0" opacity=".0"/>
            <path d="M-17 -10 L-17 -186 M17 -10 L17 -186" stroke="#141414" stroke-width="3"/>
            <ellipse cx="0" cy="-212" rx="20" ry="28" fill="#f2f1ec" stroke="#141414" stroke-width="3"/>
          </g></g>
          <path d="M520 720 C520 600 560 540 640 520 C720 540 760 600 760 720Z" fill="#f2f1ec" stroke="#141414" stroke-width="4"/>
          <path d="M570 720 C560 560 580 450 640 430 C700 450 720 560 710 720Z" fill="#141414"/>
        </g>
      </svg>`;
  }
};
