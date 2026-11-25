/* =====================================================================
   DELTAMETHRIN — 화면 · 입력 · 시스템 UI
   ===================================================================== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- 입력 라우터: 가장 위의 컨텍스트가 키를 받습니다 ---------- */
const Input = {
  stack: [],
  push(ctx) { this.stack.push(ctx); return ctx; },
  pop(ctx) { const i = this.stack.lastIndexOf(ctx); if (i >= 0) this.stack.splice(i, 1); },
  top() { return this.stack[this.stack.length - 1]; },
  init() {
    window.addEventListener('keydown', e => {
      Audio2.init();
      const top = this.top();
      if (e.repeat && !(top && top.allowRepeat)) { if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault(); return; }
      if (top && top.key && top.key(e) === true) { e.preventDefault(); return; }
      if (!top || !top.modal) {
        if (e.code === 'Escape' && UI.inPlay()) { e.preventDefault(); UI.openMenu(); return; }
        if (e.code === 'KeyI' && UI.inPlay()) { e.preventDefault(); UI.openInv(); return; }
        if (e.code === 'KeyL' && UI.inPlay()) { e.preventDefault(); UI.openLog(); return; }
        if (e.code === 'KeyA' && UI.inPlay()) { e.preventDefault(); UI.toggleAuto(); return; }
      }
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { const t = this.top(); if (t && t.keyup) t.keyup(e); });
  }
};

/* 방향키로 고르는 버튼 목록 공용 처리 */
function navList(buttons, { onPick, axis = 'y', start = 0, wrap = true, onFocus } = {}) {
  let idx = -1;
  const focus = i => {
    const list = buttons().filter(b => !b.disabled && !b.classList.contains('gone'));
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    buttons().forEach(b => b.classList.remove('focus'));
    list[idx].classList.add('focus');
    onFocus && onFocus(list[idx]);
  };
  return {
    key(e) {
      const list = buttons().filter(b => !b.disabled && !b.classList.contains('gone'));
      const prev = axis === 'y' ? ['ArrowUp', 'ArrowLeft'] : ['ArrowLeft', 'ArrowUp'];
      const next = axis === 'y' ? ['ArrowDown', 'ArrowRight'] : ['ArrowRight', 'ArrowDown'];
      if (prev.includes(e.code)) { focus(idx < 0 ? start : idx - 1); Audio2.sfx('click'); return true; }
      if (next.includes(e.code)) { focus(idx < 0 ? start : idx + 1); Audio2.sfx('click'); return true; }
      if ((e.code === 'Space' || e.code === 'Enter') && idx >= 0 && list[idx]) { onPick ? onPick(list[idx]) : list[idx].click(); return true; }
      if ((e.code === 'Space' || e.code === 'Enter') && idx < 0) { focus(start); return true; }
      return false;
    },
    focus, reset() { idx = -1; buttons().forEach(b => b.classList.remove('focus')); }
  };
}

/* ---------- 화면 ---------- */
const UI = {
  playing: false,
  auto: false,
  saveBlocked: false,
  _bgFlip: false,

  inPlay() { return this.playing && !$('#game').classList.contains('screen-title'); },

  scale() {
    const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    $('#game').style.setProperty('--scale', `scale(${s})`);
  },

  /* 배경 */
  art(kind, id) {
    const map = { bg: ASSETS.BACKGROUNDS, ch: ASSETS.CHARACTERS, img: ASSETS.ILLUSTRATIONS, icon: ASSETS.ITEM_ICONS }[kind];
    if (map && map[id]) return `<img src="${esc(map[id])}" alt="">`;
    return kind === 'bg' ? ART.bg(id) : kind === 'ch' ? ART.ch(id) : kind === 'img' ? ART.img(id) : ART.icon(id);
  },
  setBg(id, fade = 900) {
    const a = $('#bgA'), b = $('#bgB');
    const [show, hide] = this._bgFlip ? [a, b] : [b, a];
    this._bgFlip = !this._bgFlip;
    show.style.setProperty('--fade', fade + 'ms'); hide.style.setProperty('--fade', fade + 'ms');
    show.innerHTML = this.art('bg', id);
    show.classList.toggle('distort', id === 'purify_distort');
    show.style.zIndex = 2; hide.style.zIndex = 1;
    requestAnimationFrame(() => { show.classList.add('on'); setTimeout(() => hide.classList.remove('on'), fade + 30); });
    Game.s.view.bg = id;
  },
  setChars(show) {
    for (const pos of ['left', 'center', 'right']) {
      if (!(pos in show)) continue;
      const id = show[pos];
      const el = $(`.slot[data-pos=${pos}]`);
      Game.s.view.chars[pos] = id;
      if (!id) { el.classList.remove('on'); setTimeout(() => { if (!Game.s.view.chars[pos]) el.innerHTML = ''; }, 500); continue; }
      el.innerHTML = this.art('ch', id);
      el.classList.toggle('wide', ART.chWide(id) && !ASSETS.CHARACTERS[id]);
      requestAnimationFrame(() => el.classList.add('on'));
    }
  },
  clearChars() { this.setChars({ left: null, center: null, right: null }); },
  loc(name) { $('#tbLoc').textContent = name || ''; Game.s.view.loc = name || ''; },
  chapterLabel(label) { $('#tbChapter').textContent = label; Game.s.view.chapter = label; },

  /* 대화 */
  say(cmd) {
    return new Promise(resolve => {
      const dlg = $('#dialog'), name = $('#dlgName'), text = $('#dlgText');
      const style = cmd.style || (cmd.crowd ? 'crowd' : cmd.radio ? 'radio' : (!cmd.who ? 'narr' : ''));
      dlg.className = style; dlg.classList.remove('hidden');
      name.textContent = cmd.who || '';
      Game.pushLog(cmd.who, cmd.text, style);
      const full = cmd.text;
      const speed = Game.settings.speed;
      const delay = speed >= 100 ? 0 : Math.round(70 - speed * .66); // ms per char
      let i = 0, done = false, timer = null, autoT = null;
      text.textContent = '';
      // 화자 강조
      const speakerSlot = this.slotOf(cmd.who);
      $$('.slot').forEach(s => s.classList.toggle('dim', !!speakerSlot && s !== speakerSlot && s.classList.contains('on')));
      const finish = () => {
        done = true; clearTimeout(timer); text.textContent = full; dlg.classList.add('done');
        if (this.auto) autoT = setTimeout(advance, 900 + full.length * 45);
      };
      const tick = () => {
        if (i >= full.length) return finish();
        i += 1; text.textContent = full.slice(0, i);
        if (i % 3 === 0 && full[i - 1] !== ' ') Audio2.sfx('text');
        timer = setTimeout(tick, /[.,…?!]/.test(full[i - 1]) ? delay * 5 : delay);
      };
      const advance = () => {
        if (!done) return finish();
        clearTimeout(autoT);
        Input.pop(ctx); dlg.removeEventListener('click', onClick);
        dlg.classList.remove('done');
        resolve();
      };
      const onClick = e => { if (e.target.closest('.tool')) return; Audio2.init(); advance(); };
      const ctx = Input.push({
        name: 'say', saveable: true,
        key: e => { if (e.code === 'Space' || e.code === 'Enter') { advance(); return true; } return false; },
        poke: () => { if (done && this.auto) { clearTimeout(autoT); autoT = setTimeout(advance, 600); } }
      });
      dlg.addEventListener('click', onClick);
      if (delay === 0) finish(); else tick();
    });
  },
  slotOf(who) {
    const m = { '소야': ['soya', 'soya_far'], '미라': ['mira'], '관리인': ['manager'], '어머님': ['mother', 'mother_true', 'mother_shadow', 'mother_silhouette'], '노인': ['elder'], '어린 주민': ['child'] }[who];
    if (!m) return null;
    return $$('.slot').find(s => m.includes(Game.s.view.chars[s.dataset.pos])) || null;
  },
  hideDialog() { $('#dialog').classList.add('hidden'); },
  toggleAuto() {
    this.auto = !this.auto; $('#btnAuto').classList.toggle('on', this.auto);
    const t = Input.top(); if (t && t.poke) t.poke();
  },

  illus(id) {
    const el = $('#illus');
    if (!id) { el.classList.add('hidden'); return; }
    el.querySelector('.illus-frame').innerHTML = this.art('img', id);
    el.classList.remove('hidden');
  },

  doc(cmd) {
    return new Promise(resolve => {
      this.hideDialog();
      const el = $('#doc'), p = $('#docPaper');
      p.className = 'doc-paper ' + (cmd.kind || '') + (cmd.zoom ? ' zoom' : '');
      p.innerHTML = (cmd.title ? `<h3>${esc(cmd.title)}</h3>` : '') + cmd.lines.map(l => `<p>${esc(l)}</p>`).join('') + (cmd.stamp ? '<div class="stamp">처리<br>완료</div>' : '');
      Game.pushLog('', cmd.lines.join('\n'), 'doc');
      el.classList.remove('hidden');
      let ready = false; setTimeout(() => ready = true, 500);
      const close = () => { if (!ready) return; Input.pop(ctx); el.removeEventListener('click', close); el.classList.add('hidden'); Audio2.sfx('paper'); resolve(); };
      const ctx = Input.push({ name: 'doc', saveable: true, key: e => { if (e.code === 'Space' || e.code === 'Enter') { close(); return true; } return false; } });
      el.addEventListener('click', close);
    });
  },

  card(label, title) {
    return new Promise(resolve => {
      this.hideDialog();
      $('#cardLabel').textContent = label; $('#cardTitle').textContent = title;
      const el = $('#card'); el.classList.remove('hidden');
      Audio2.sfx('bell_low');
      let t = setTimeout(close, 3200);
      function close() { clearTimeout(t); Input.pop(ctx); el.removeEventListener('click', close); el.classList.add('hidden'); resolve(); }
      const ctx = Input.push({ name: 'card', key: e => { if (e.code === 'Space' || e.code === 'Enter') { close(); return true; } return false; } });
      setTimeout(() => el.addEventListener('click', close), 600);
    });
  },

  bigText(text, { hold = 2600, small = false, onWhite = false } = {}) {
    return new Promise(resolve => {
      this.hideDialog();
      const el = $('#bigText');
      el.textContent = text; el.className = (small ? 'small ' : '') + (onWhite ? 'onwhite' : '');
      Game.pushLog('', text, 'big');
      let ready = false; setTimeout(() => ready = true, 900);
      const t = setTimeout(close, hold);
      function close() { if (!ready) return; clearTimeout(t); Input.pop(ctx); el.removeEventListener('click', close); el.classList.add('hidden'); resolve(); }
      const ctx = Input.push({ name: 'big', key: e => { if (e.code === 'Space' || e.code === 'Enter') { close(); return true; } return false; } });
      el.addEventListener('click', close);
    });
  },

  toast(itemId, update) {
    const it = ITEMS[itemId]; if (!it) return;
    const el = $('#toast');
    el.innerHTML = `${this.art('icon', it.icon)}<span>${update ? '단서 갱신' : '획득'} — <b>${esc(it.name)}</b></span>`;
    el.classList.add('on'); Audio2.sfx('item');
    clearTimeout(this._toastT); this._toastT = setTimeout(() => el.classList.remove('on'), 2600);
    this.updateInvBadge();
  },
  updateInvBadge() {
    const n = Game.s.inventory.length;
    $('#btnInv').innerHTML = `<span class="tool-ico"></span>소지품${n ? ` <span class="badge">${n}</span>` : ''}`;
  },

  async fx(id, cmd = {}) {
    const g = $('#game');
    const low = !Game.settings.fx;
    g.classList.toggle('lowfx', low);
    const pulse = async (cls, ms) => { g.classList.remove(cls); void g.offsetWidth; g.classList.add(cls); await sleep(ms); g.classList.remove(cls); };
    switch (id) {
      case 'shake': Audio2.sfx('thud'); await pulse('shake', 460); break;
      case 'quake': Audio2.sfx('thud'); await pulse('quake', 1100); break;
      case 'glitch': Audio2.sfx('glitch'); await pulse('glitch', cmd.ms || 700); break;
      case 'flicker': Audio2.sfx('machine'); await pulse('flicker', 1400); break;
      case 'stare': Audio2.sfx('whisper'); await pulse('stare', 1800); break;
      case 'flash': { const f = $('#fade'); f.classList.add('white', 'on'); await sleep(900); f.classList.remove('on'); await sleep(800); f.classList.remove('white'); break; }
      case 'dark': { this.hideDialog(); const f = $('#fade'); f.classList.add('on'); await sleep(1100); this.clearChars(); this.illus(null); f.classList.remove('on'); break; }
      case 'calm': $('#grain').style.opacity = .12; $('#vignette').style.opacity = .5; break;
      case 'dots': {
        const box = document.createElement('div'); box.className = 'dots';
        for (let k = 0; k < 220; k++) {
          const i = document.createElement('i');
          i.style.left = (Math.random() * 100) + '%'; i.style.top = (30 + Math.random() * 70) + '%';
          i.style.animationDelay = (Math.random() * 1.6) + 's';
          box.appendChild(i);
        }
        $('#stage').appendChild(box);
        await sleep(1800); setTimeout(() => box.remove(), 2600); break;
      }
      case 'papers_merge': {
        const m = document.createElement('div'); m.className = 'papers-merge';
        m.innerHTML = '<div style="transform:translateX(-230px) rotate(-3deg)"></div><div style="transform:translateX(230px) rotate(3deg)"></div>';
        $('#game').appendChild(m); this.hideDialog();
        await sleep(400);
        m.querySelectorAll('div').forEach(d => { d.style.transform = 'translateX(0) rotate(0)'; d.style.background = '#000'; });
        await sleep(2700); m.style.transition = 'opacity .8s'; m.style.opacity = 0; await sleep(800); m.remove(); break;
      }
      case 'burn': {
        $('#redwash').style.opacity = .35; await sleep(900); $('#redwash').style.opacity = .15; break;
      }
    }
  },

  whispers(lines, { clear = false, grow = false } = {}) {
    const box = $('#whispers');
    if (clear) { box.innerHTML = ''; return; }
    const spots = [[6, 6], [62, 4], [32, 22], [4, 46], [70, 40], [40, 56], [16, 26], [56, 24]];
    lines.forEach(([who, text], k) => {
      setTimeout(() => {
        const b = document.createElement('div'); b.className = 'wb';
        const sp = spots[(box.children.length) % spots.length];
        b.style.left = sp[0] + '%'; b.style.top = sp[1] + '%';
        if (grow) b.style.fontSize = (15 + k * 2) + 'px';
        b.innerHTML = `<b>${esc(who)}</b>${esc(text)}`;
        box.appendChild(b); Audio2.sfx('whisper');
        Game.pushLog(who, text, 'whisper');
      }, k * 650);
    });
  },

  popup(msg, { yes = '확인', no = '취소', red = true } = {}) {
    return new Promise(resolve => {
      const el = $('#popup');
      $('#popMsg').textContent = msg; $('#popYes').textContent = yes; $('#popNo').textContent = no;
      $('#popNo').style.display = no ? '' : 'none';
      el.classList.remove('hidden'); Audio2.sfx('warn');
      const nav = navList(() => [$('#popNo'), $('#popYes')].filter(b => b.style.display !== 'none'), { axis: 'x' });
      const done = v => { Input.pop(ctx); el.classList.add('hidden'); $('#popYes').onclick = $('#popNo').onclick = null; nav.reset(); Audio2.sfx('click'); resolve(v); };
      $('#popYes').onclick = () => done(true);
      $('#popNo').onclick = () => done(false);
      const ctx = Input.push({ name: 'popup', modal: true, key: e => { if (e.code === 'Escape') { if (no) done(false); return true; } return nav.key(e); } });
    });
  },

  /* ---------- 시스템 모달 ---------- */
  openModal(id, onKey) {
    const el = $('#' + id); el.classList.remove('hidden');
    const ctx = Input.push({ name: id, modal: true, key: e => { if (e.code === 'Escape' || (id === 'inv' && e.code === 'KeyI') || (id === 'log' && e.code === 'KeyL')) { this.closeModal(id); return true; } return onKey ? onKey(e) : true; } });
    el._ctx = ctx;
    return ctx;
  },
  closeModal(id) { const el = $('#' + id); el.classList.add('hidden'); if (el._ctx) Input.pop(el._ctx); el._ctx = null; Audio2.sfx('click'); },

  openMenu() {
    const btns = () => $$('#menu .menu-list button');
    const nav = navList(btns);
    this.openModal('menu', e => nav.key(e));
    nav.focus(0);
  },
  canSave() {
    const t = Input.stack.filter(c => !c.modal).pop();
    return !!(t && t.saveable) && !this.saveBlocked;
  },
  openSlots(mode) {
    $('#slotsTitle').textContent = mode === 'save' ? 'SAVE' : 'LOAD';
    $('#slotsNote').textContent = '';
    const list = $('#slotList');
    const rows = [];
    for (let n = (mode === 'save' ? 1 : 0); n <= SLOT_COUNT; n++) {
      const d = Game.readSlot(n);
      const name = n === 0 ? 'AUTO' : `SLOT ${n}`;
      rows.push(`<button class="slot-row ${d ? '' : 'empty'} ${n === 0 ? 'auto' : ''}" data-n="${n}">
        <span class="n">${name}</span>
        <span class="m">${d ? `${esc(d.chapter || '')} · ${esc(d.loc || '')}<small>${esc(d.label || '')}</small>` : '비어 있음'}</span>
        <span class="t">${d ? new Date(d.at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span></button>`);
    }
    list.innerHTML = rows.join('');
    const nav = navList(() => $$('#slotList .slot-row'));
    list.querySelectorAll('.slot-row').forEach(b => b.onclick = async () => {
      const n = +b.dataset.n, d = Game.readSlot(n);
      if (mode === 'save') {
        if (!this.canSave()) { $('#slotsNote').textContent = '지금은 저장할 수 없습니다. 대사가 표시될 때 저장해 주세요.'; return; }
        if (d && !(await this.popup(`SLOT ${n}에 덮어쓰시겠습니까?`, { red: false }))) return;
        const last = Game.s.log.filter(l => l.text).slice(-1)[0];
        const ok = Game.writeSlot(n, last ? (last.who ? last.who + ': ' : '') + last.text.split('\n')[0].slice(0, 40) : '');
        Audio2.sfx('confirm');
        $('#slotsNote').textContent = ok ? `SLOT ${n}에 저장했습니다.` : '이 브라우저에서는 저장 공간을 쓸 수 없어, 창을 닫으면 저장이 사라집니다.';
        this.openSlots('save');
        $('#slotsNote').textContent = ok ? `SLOT ${n}에 저장했습니다.` : '이 브라우저에서는 저장 공간을 쓸 수 없어, 창을 닫으면 저장이 사라집니다.';
      } else {
        if (!d) return;
        if (this.inPlay() && !(await this.popup('저장된 지점을 불러올까요? 지금까지의 진행은 사라집니다.', { red: false }))) return;
        $$('.modal').forEach(m => { if (!m.classList.contains('hidden')) this.closeModal(m.id); });
        Runner.loadFrom(d.state);
      }
    });
    if (!$('#slots').classList.contains('hidden')) { this.closeModal('slots'); }
    this.openModal('slots', e => nav.key(e));
  },
  openSettings() {
    const st = Game.settings;
    const bind = (id, key, out, apply) => {
      const el = $(id); el.value = st[key]; $(out).textContent = st[key];
      el.oninput = () => { st[key] = +el.value; $(out).textContent = el.value; apply && apply(+el.value); Game.saveSettings(); };
    };
    bind('#setSpeed', 'speed', '#outSpeed');
    bind('#setBgm', 'bgm', '#outBgm', v => Audio2.setVolume('bgm', v / 100));
    bind('#setSfx', 'sfx', '#outSfx', v => { Audio2.setVolume('sfx', v / 100); Audio2.sfx('click'); });
    $('#setFx').value = String(st.fx); $('#setFx').onchange = () => { st.fx = +$('#setFx').value; Game.saveSettings(); };
    $('#btnFull').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch (e) { } };
    this.openModal('settings', e => false);
  },
  openInv(sel) {
    const inv = Game.s.inventory;
    const grid = $('#invGrid');
    const cells = inv.map(id => `<button class="inv-cell" data-id="${id}">${this.art('icon', ITEMS[id].icon)}<span>${esc(ITEMS[id].name)}</span></button>`);
    for (let k = inv.length; k < 9; k++) cells.push('<div class="inv-cell empty"></div>');
    grid.innerHTML = cells.join('');
    const show = id => {
      $$('.inv-cell').forEach(c => c.classList.toggle('sel', c.dataset.id === id));
      const it = ITEMS[id];
      if (!it) { $('#invDetail').innerHTML = '<p class="empty">아직 가진 것이 없다.</p>'; return; }
      let txt = it.detail.join('\n');
      if (Game.s.itemUpd[id] && it.detailBack) txt += '\n\n' + it.detailBack.join('\n');
      $('#invDetail').innerHTML = `<div class="big">${this.art('icon', it.icon)}</div><h3>${esc(it.name)}</h3><p class="d">${esc(it.desc)}</p><div class="txt">${esc(txt)}</div>`;
    };
    grid.querySelectorAll('.inv-cell[data-id]').forEach(c => c.onclick = () => { Audio2.sfx('paper'); show(c.dataset.id); });
    show(sel || inv[inv.length - 1]);
    const nav = navList(() => $$('#invGrid .inv-cell[data-id]'), { onFocus: b => show(b.dataset.id), onPick: b => show(b.dataset.id) });
    this.openModal('inv', e => nav.key(e));
  },
  openLog() {
    const l = Game.s.log.slice(-160);
    $('#logList').innerHTML = l.map(x => x.kind === 'choice' ? `<p class="lc">▶ ${esc(x.text)}</p>` : `<p>${x.who ? `<b>${esc(x.who)}</b>` : ''}${esc(x.text)}</p>`).join('') || '<p>기록이 없습니다.</p>';
    this.openModal('log', e => { if (e.code === 'ArrowUp') { $('#logList').scrollTop -= 60; return true; } if (e.code === 'ArrowDown') { $('#logList').scrollTop += 60; return true; } return false; });
    setTimeout(() => $('#logList').scrollTop = 1e6, 10);
  },

  /* ---------- 엔딩 ---------- */
  ending(cmd) {
    return new Promise(resolve => {
      this.hideDialog();
      $('#endLabel').textContent = cmd.label; $('#endTitle').textContent = cmd.title;
      $('#endSub').innerHTML = (cmd.sub || []).map(esc).join('<br>');
      const el = $('#ending'); el.classList.remove('hidden');
      Audio2.sfx('bell_low');
      let ready = false; setTimeout(() => ready = true, 3500);
      const close = () => { if (!ready) return; Input.pop(ctx); el.removeEventListener('click', close); el.classList.add('hidden'); resolve(); };
      const ctx = Input.push({ name: 'ending', key: e => { if (e.code === 'Space' || e.code === 'Enter') { close(); return true; } return false; } });
      el.addEventListener('click', close);
      setTimeout(close, 9000);
    });
  },
  credits() {
    return new Promise(resolve => {
      const roll = $('#crRoll');
      roll.innerHTML = `<div class="big">DELTAMETHRIN</div>
        <h4>기획 · 시나리오</h4><div>DELTAMETHRIN 팀</div>
        <h4>시나리오 기준</h4><div>전체 게임 시나리오 및 대사집 Ver. 2.0</div>
        <h4>게임 시스템 · UI/UX · 웹 개발</h4><div>DELTAMETHRIN 팀 · Claude</div>
        <h4>일러스트</h4><div>임시 목탄 스케치 (교체 예정)</div>
        <h4>사운드</h4><div>WebAudio 합성 (교체 예정)</div>
        <h4>등장인물</h4><div>차비 · 소야 · 어머님 · 관리인 · 미라 · 노인 · 가족들</div>
        <h4></h4><div>당신의 선택은 정말 당신의 것입니까?</div>`;
      const el = $('#credits'); el.classList.remove('hidden');
      roll.style.transition = 'none'; roll.style.transform = 'translateY(0)';
      void roll.offsetWidth;
      const dist = roll.offsetHeight + 720;
      roll.style.transition = 'transform 22s linear'; roll.style.transform = `translateY(-${dist}px)`;
      const t = setTimeout(close, 22500);
      function close() { clearTimeout(t); Input.pop(ctx); el.removeEventListener('click', close); el.classList.add('hidden'); resolve(); }
      const ctx = Input.push({ name: 'credits', key: e => { if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') { close(); return true; } return false; } });
      setTimeout(() => el.addEventListener('click', close), 1500);
    });
  },
  summary() {
    return new Promise(resolve => {
      const ids = Array.from({ length: 20 }, (_, i) => 'c' + String(i + 1).padStart(2, '0'));
      const forced = { c13: 1, c14: 1, c20: 1 };
      let conf = 0, self = 0, blocked = 0;
      const cells = ids.map((id, i) => {
        const v = Game.s.choices[id];
        let cls = 'c';
        if (forced[id]) cls = 'f';
        else if (Game.s.tried[id]) { cls = 'x'; blocked++; }
        else if (v === 'B') { cls = 's'; self++; }
        else conf++;
        return `<i class="${cls}">${i + 1}</i>`;
      }).join('');
      $('#sumBox').innerHTML = `<h3>선택의 기록</h3><div class="sum-grid">${cells}</div>
        <div class="sum-leg"><span class="c">집단의 답</span><span class="s">스스로의 답</span><span class="x">스스로 답하려 했으나 바뀐 답</span><span class="f">처음부터 하나뿐이던 답</span></div>
        <div class="sum-text">스무 번의 선택 가운데 ${conf + blocked + 3}번, 차비는 다른 누군가가 정한 답에 도착했습니다.<br>
        그리고 스스로 내렸다고 믿었던 마지막 선택도, 누군가 미리 깔아 둔 길 위에 있었습니다.</div>
        <button class="sum-btn" id="sumBtn">타이틀로</button>`;
      const el = $('#summary'); el.classList.remove('hidden');
      const close = () => { Input.pop(ctx); el.classList.add('hidden'); resolve(); };
      $('#sumBtn').onclick = close;
      const ctx = Input.push({ name: 'summary', key: e => { if (e.code === 'Space' || e.code === 'Enter') { close(); return true; } return false; } });
    });
  }
};
