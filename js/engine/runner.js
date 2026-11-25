/* =====================================================================
   DELTAMETHRIN — 스크립트 실행기
   상태는 프레임 스택(Game.s.frames)으로 관리됩니다.
   프레임 = { node, path, i } : path 는 STORY.nodes[node] 안의 하위 목록 위치
   저장 시 프레임 스택과 화면 상태를 그대로 기록하고, 불러오면 현재 명령부터 다시 실행합니다.
   ===================================================================== */
const Runner = {
  token: 0,

  list(frame) {
    let o = STORY.nodes[frame.node];
    for (const p of frame.path) o = o[p];
    return o;
  },

  async start(state) {
    const my = ++this.token;
    Game.s = state;
    Title.hide();
    UI.playing = true; UI.saveBlocked = false;
    $('#game').classList.remove('screen-title');
    this.restoreView();
    await this.loop(my);
  },
  newGame() { Audio2.init(); this.start(freshState()); },
  loadFrom(state) {
    Audio2.init();
    this.resetScreen();
    this.start(JSON.parse(JSON.stringify(state)));
  },
  resetScreen() {
    ['#choices', '#map', '#doc', '#hold', '#fp', '#card', '#bigText', '#bigFace', '#investigate', '#ending', '#credits', '#summary', '#illus', '#eyes', '#popup'].forEach(s => $(s).classList.add('hidden'));
    $('#whispers').innerHTML = ''; $('#fpWorld').innerHTML = '';
    $('#game').classList.remove('glitch', 'shake', 'quake', 'flicker', 'stare');
    $('#fade').classList.remove('on', 'white');
    $('#grain').style.opacity = ''; $('#vignette').style.opacity = ''; $('#redwash').style.opacity = 0;
    $$('.papers-merge,.dots').forEach(e => e.remove());
    Input.stack = [];
    UI.hideDialog();
  },
  restoreView() {
    const v = Game.s.view;
    UI.setBg(v.bg || 'white', 0);
    UI.setChars(v.chars || {});
    UI.loc(v.loc); UI.chapterLabel(v.chapter || '');
    Audio2.bgm(v.bgm || null);
    UI.updateInvBadge();
  },
  toTitle() {
    this.token++;
    this.resetScreen();
    Input.stack = [];
    UI.playing = false;
    Audio2.bgm('title');
    Title.show();
  },

  autosave() {
    const last = Game.s.log.filter(l => l.text).slice(-1)[0];
    Game.writeSlot(0, last ? (last.who ? last.who + ': ' : '') + last.text.split('\n')[0].slice(0, 40) : '');
  },

  async loop(my) {
    const s = () => Game.s;
    while (my === this.token) {
      const frames = s().frames;
      const fr = frames[frames.length - 1];
      if (!fr) return;
      const list = this.list(fr);
      if (fr.i >= list.length) {
        frames.pop();
        if (!frames.length) return;
        const parent = frames[frames.length - 1];
        if (!fr.stay) parent.i++;
        continue;
      }
      const cmd = list[fr.i];
      const r = await this.exec(cmd, fr);
      if (my !== this.token) return;
      if (r && r.push) { frames.push({ node: fr.node, path: [...fr.path, fr.i, ...r.push], i: 0, stay: !!r.stay }); continue; }
      if (r && r.jump) { s().frames = [{ node: r.jump, path: [], i: 0 }]; this.autosave(); continue; }
      if (r && r.end) return;
      fr.i++;
    }
  },

  async exec(c, fr) {
    const v = Game.s.view;
    switch (c.t) {
      case 'say': {
        if (c.offscreen) $$('.slot').forEach(e => e.classList.remove('dim'));
        await UI.say(c); return;
      }
      case 'chapter': UI.chapterLabel(c.label); UI.loc(''); await UI.card(c.label, c.title); return;
      case 'loc': UI.loc(c.name); return;
      case 'bg': UI.setBg(c.id, c.fade ?? 900); if ((c.fade ?? 900) > 0) await sleep(Math.min(c.fade ?? 900, 700)); return;
      case 'ch': UI.setChars(c.show); await sleep(250); return;
      case 'bgm': v.bgm = c.id; Audio2.bgm(c.id); return;
      case 'sfx': Audio2.sfx(c.id); return;
      case 'fx': UI.hideDialog(); await UI.fx(c.id, c); return;
      case 'img': UI.illus(c.id); return;
      case 'wait': if (c.silent) UI.hideDialog(); await sleep(c.ms); return;
      case 'title': await UI.bigText(c.text, { hold: c.hold || 2600, small: !!c.small }); return;
      case 'doc': await UI.doc(c); return;
      case 'item':
        Game.addItem(c.id);
        if (c.update) Game.s.itemUpd[c.id] = true;
        UI.toast(c.id, c.update); return;
      case 'set': Game.s.flags[c.flag] = c.v; return;
      case 'whispers': UI.whispers(c.lines || [], c); if (!c.clear) await sleep(((c.lines || []).length) * 650 + 300); return;
      case 'choice': {
        const key = await Choices.run(c);
        const branch = c[key];
        if (branch && branch.length) return { push: [key] };
        return;
      }
      case 'if': {
        const ok = c.flag ? !!Game.s.flags[c.flag] : (Game.s.choices[c.choice] === c.is);
        const key = ok ? 'then' : 'else';
        if (c[key] && c[key].length) return { push: [key] };
        return;
      }
      case 'map': await Interact.map(c); return;
      case 'press': await Interact.press(c); return;
      case 'hold': await Interact.hold(c); return;
      case 'investigate': {
        UI.setBg(c.bg, 0);
        const k = await Interact.investigate(c);
        if (k < 0) return;
        const spot = c.spots[k];
        if (spot.needFlag && !Game.s.flags[spot.needFlag]) return { push: ['spots', k, 'locked'], stay: true };
        Game.s.inspected[`${c.id}.${spot.id}`] = true;
        return { push: ['spots', k, 'run'], stay: true };
      }
      case 'fp3d': UI.saveBlocked = true; await Scene3D.run(c); UI.saveBlocked = false; return;
      case 'ending': await UI.ending(c); return;
      case 'credits': await UI.credits(); return;
      case 'summary': await UI.summary(); return;
      case 'toTitle': Store.set(KEY + '.cleared', '1'); this.toTitle(); return { end: true };
      case 'next': return { jump: c.node };
      default: console.warn('알 수 없는 명령', c); return;
    }
  }
};
