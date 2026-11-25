/* =====================================================================
   DELTAMETHRIN — 시작
   ===================================================================== */
const Title = {
  ctx: null,
  show() {
    const g = $('#game');
    g.classList.add('screen-title');
    $('#tiArt').innerHTML = UI.art('bg', 'island');
    $('#tiContinue').disabled = !Game.latestSlot();
    const nav = navList(() => $$('.ti-menu button'));
    if (this.ctx) Input.pop(this.ctx);
    this.ctx = Input.push({ name: 'title', key: e => nav.key(e) });
  },
  hide() { if (this.ctx) Input.pop(this.ctx); this.ctx = null; }
};

(function boot() {
  Game.loadSettings();
  Audio2.setVolume('bgm', Game.settings.bgm / 100);
  Audio2.setVolume('sfx', Game.settings.sfx / 100);
  UI.scale();
  window.addEventListener('resize', () => UI.scale());
  Input.init();

  // 첫 상호작용에서 오디오 시작 (브라우저 정책)
  const unlock = () => { Audio2.init(); if (!UI.playing && !Audio2.id) Audio2.bgm('title'); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  // 타이틀
  $$('.ti-menu button').forEach(b => b.onclick = async () => {
    Audio2.init(); Audio2.sfx('click');
    const a = b.dataset.ti;
    if (a === 'new') {
      if (Game.readSlot(0) && !(await UI.popup('처음부터 시작할까요? 자동 저장은 새 진행으로 덮어써집니다.', { red: false }))) return;
      Title.hide(); Runner.newGame();
    }
    if (a === 'continue') { const l = Game.latestSlot(); if (l) { Title.hide(); Runner.loadFrom(l.d.state); } }
    if (a === 'load') UI.openSlots('load');
    if (a === 'settings') UI.openSettings();
  });

  // 상단/하단 버튼
  $('#btnMenu').onclick = () => { Audio2.sfx('click'); UI.openMenu(); };
  $('#btnLog').onclick = () => { Audio2.sfx('click'); UI.openLog(); };
  $('#btnInv').onclick = e => { e.stopPropagation(); Audio2.sfx('click'); UI.openInv(); };
  $('#btnAuto').onclick = e => { e.stopPropagation(); UI.toggleAuto(); };
  $$('[data-close]').forEach(b => b.onclick = () => UI.closeModal(b.dataset.close));

  // 메뉴
  $$('#menu [data-act]').forEach(b => b.onclick = async () => {
    const a = b.dataset.act;
    Audio2.sfx('click');
    if (a === 'resume') UI.closeModal('menu');
    if (a === 'save') { UI.closeModal('menu'); UI.openSlots('save'); if (!UI.canSave()) $('#slotsNote').textContent = '지금은 저장할 수 없습니다. 대사가 표시될 때 저장해 주세요.'; }
    if (a === 'load') { UI.closeModal('menu'); UI.openSlots('load'); }
    if (a === 'inv') { UI.closeModal('menu'); UI.openInv(); }
    if (a === 'settings') { UI.closeModal('menu'); UI.openSettings(); }
    if (a === 'title') {
      if (await UI.popup('타이틀로 돌아갈까요? 저장하지 않은 진행은 마지막 자동 저장 지점부터 이어집니다.', { red: false })) {
        UI.closeModal('menu'); Runner.toTitle();
      }
    }
  });

  // 탭을 닫거나 숨길 때 자동 저장
  document.addEventListener('visibilitychange', () => { if (document.hidden && UI.inPlay() && UI.canSave()) Runner.autosave(); });

  Title.show();
})();
