/* =====================================================================
   DELTAMETHRIN — 게임 상태 · 저장/불러오기 · 설정
   ===================================================================== */
const Store = (() => {
  const mem = {};
  const get = k => { try { const v = localStorage.getItem(k); return v === null ? (mem[k] ?? null) : v; } catch (e) { return mem[k] ?? null; } };
  const set = (k, v) => { mem[k] = v; try { localStorage.setItem(k, v); return true; } catch (e) { return false; } };
  const del = k => { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { } };
  return { get, set, del };
})();

const KEY = 'deltamethrin.v1';
const SLOT_COUNT = 6;

function freshState() {
  return {
    frames: [{ node: STORY.start, path: [], i: 0 }],
    choices: {},        // c01: 'A' | 'B'
    tried: {},          // 자율 선택을 시도했으나 막힌 기록
    conformity: 0,      // 순응도: 순응 +1, 자율 -1 (선악이 아닌 '집단 우선' 정도)
    flags: {},
    inventory: [],      // 아이템 id
    itemUpd: {},        // 아이템 상태(뒷면 발견 등)
    inspected: {},      // 조사 완료 지점
    view: { bg: 'white', chars: { left: null, center: null, right: null }, bgm: null, loc: '', chapter: '', distort: false },
    log: [],
    started: Date.now(),
    playMs: 0
  };
}

const Game = {
  s: freshState(),
  settings: { speed: 60, bgm: 70, sfx: 80, fx: 1 },

  loadSettings() {
    try { Object.assign(this.settings, JSON.parse(Store.get(KEY + '.settings') || '{}')); } catch (e) { }
  },
  saveSettings() { Store.set(KEY + '.settings', JSON.stringify(this.settings)); },

  slotKey(n) { return `${KEY}.slot.${n}`; },
  readSlot(n) { try { return JSON.parse(Store.get(this.slotKey(n)) || 'null'); } catch (e) { return null; } },
  writeSlot(n, label) {
    const data = { v: 1, at: Date.now(), label, chapter: this.s.view.chapter, loc: this.s.view.loc, state: JSON.parse(JSON.stringify(this.s)) };
    data.state.log = data.state.log.slice(-120);
    return Store.set(this.slotKey(n), JSON.stringify(data));
  },
  hasAnySave() { for (let n = 0; n <= SLOT_COUNT; n++) if (this.readSlot(n)) return true; return false; },
  latestSlot() {
    let best = null;
    for (let n = 0; n <= SLOT_COUNT; n++) { const d = this.readSlot(n); if (d && (!best || d.at > best.d.at)) best = { n, d }; }
    return best;
  },

  addItem(id) { if (!this.s.inventory.includes(id)) this.s.inventory.push(id); },
  hasItem(id) { return this.s.inventory.includes(id); },
  choose(id, key, conform) {
    this.s.choices[id] = key;
    if (conform === true) this.s.conformity += 1;
    else if (conform === false) this.s.conformity -= 1;
  },
  pushLog(who, text, kind) {
    this.s.log.push({ who: who || '', text, kind: kind || '' });
    if (this.s.log.length > 400) this.s.log.shift();
  }
};
