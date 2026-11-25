/* =====================================================================
   DELTAMETHRIN — 임시 일러스트 (절차적 SVG, 목탄 질감)
   ---------------------------------------------------------------------
   실제 일러스트가 준비되면 js/data/assets.js 에서 같은 키에 이미지 경로를 지정하세요.
   지정된 이미지가 있으면 이 파일의 임시 그림 대신 이미지를 사용합니다.
   필터/패턴(#rough, #rough2, #smudge, #hatch, #hatchD, #sunGlow, #grain)은 index.html 의 <svg id="defs"> 에 있습니다.
   ===================================================================== */
const ART = (() => {
  const INK = '#141414', PAPER = '#ebe8e1', PAPER2 = '#d9d6cf', COLD = '#dfe8ef', RED = '#8e1b14';
  const R = 'filter="url(#rough)"', R2 = 'filter="url(#rough2)"';

  // ---------- 공용 도형 ----------
  const paper = (c = PAPER) => `<rect width="1600" height="900" fill="${c}"/>`;
  const smudge = (x, y, rx, ry, o = .25) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#000" opacity="${o}" filter="url(#smudge)"/>`;
  const hatchRect = (x, y, w, h, id = 'hatch', o = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})" opacity="${o}" ${R}/>`;
  const line = (x1, y1, x2, y2, w = 3, c = INK) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none" ${R}/>`;
  const sun = (x, y, r = 70, rings = false) => `
    <circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#sunGlow)"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="#f7fafc" stroke="#8ea2b3" stroke-width="3" ${R}/>
    ${rings ? `<circle cx="${x}" cy="${y}" r="${r + 18}" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="14 9" ${R}/>
      <circle cx="${x}" cy="${y}" r="${r + 40}" fill="none" stroke="${INK}" stroke-width="2" ${R}/>` : ''}`;
  // 두건 쓴 주민 (뒷모습)
  const figure = (x, y, s = 1, o = {}) => {
    const robe = o.robe || INK, head = o.head || INK;
    const arm = o.hand ? `<path d="M${o.hand > 0 ? 18 : -18} -120 L${o.hand > 0 ? 34 : -34} -205" stroke="${robe}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="${o.hand > 0 ? 36 : -36}" cy="-212" r="8" fill="${robe}"/>` : '';
    const face = o.face ? `<circle cx="0" cy="-160" r="17" fill="${PAPER}"/>
      <circle cx="-6" cy="-162" r="3.4" fill="${INK}"/><circle cx="6" cy="-162" r="3.4" fill="${INK}"/>` : '';
    return `<g transform="translate(${x} ${y}) scale(${s})" ${R}>
      <path d="M-24 -150 C-34 -110 -46 -40 -52 0 L52 0 C46 -40 34 -110 24 -150 Q0 -136 -24 -150Z" fill="${robe}" ${o.stroke ? `stroke="${INK}" stroke-width="3"` : ''}/>
      <path d="M-25 -150 Q-28 -192 0 -194 Q28 -192 25 -150 Q0 -138 -25 -150Z" fill="${head}"/>
      ${face}${arm}</g>`;
  };
  const crowd = (y, n, s, x0 = 0, x1 = 1600, o = {}) => {
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * (i + .5) / n + Math.sin(i * 7.3) * 14;
      const oo = Object.assign({}, o);
      if (o.hands) oo.hand = (i * 37 % 100) / 100 < o.hands ? (i % 2 ? 1 : -1) : 0;
      if (o.faces) oo.face = true;
      out += figure(x, y + Math.cos(i * 3.1) * 6, s * (1 + Math.sin(i * 2.7) * .06), oo);
    }
    return out;
  };
  // 백조 날개 (흰 깃털)
  const swanWing = (cx, cy, s = 1, flip = 1) => {
    let f = '';
    for (let i = 0; i < 9; i++) {
      const a = -80 + i * 13;
      const len = 260 - i * 14;
      f += `<path d="M0 0 Q${Math.cos(a * Math.PI / 180) * len * .5} ${Math.sin(a * Math.PI / 180) * len * .5 - 30} ${Math.cos(a * Math.PI / 180) * len} ${Math.sin(a * Math.PI / 180) * len}"
        stroke="${INK}" stroke-width="2.2" fill="none" opacity=".8"/>`;
    }
    return `<g transform="translate(${cx} ${cy}) scale(${s * flip} ${s})" ${R}>
      <path d="M0 0 C60 -160 220 -230 300 -170 C260 -120 280 -40 250 30 C190 10 120 40 0 20Z" fill="#f6f6f3" stroke="${INK}" stroke-width="4"/>
      ${f}</g>`;
  };
  // 바퀴벌레 날개 (반투명 막 + 검은 줄기)
  const roachWing = (cx, cy, s = 1, flip = 1) => `
    <g transform="translate(${cx} ${cy}) scale(${s * flip} ${s})" ${R2}>
      <path d="M0 0 C70 -150 240 -210 330 -150 C300 -60 300 40 260 120 C170 90 90 70 0 25Z" fill="#5a4a36" opacity=".55" stroke="${INK}" stroke-width="5"/>
      <path d="M10 10 C110 -60 210 -120 320 -140 M20 18 C120 -10 220 -40 300 -40 M20 22 C120 30 200 60 270 110 M80 -40 L130 30 M170 -90 L200 60 M240 -120 L250 70"
        stroke="${INK}" stroke-width="3.5" fill="none"/>
      <path d="M150 -60 l18 30 l-26 8Z M230 0 l14 26 l-22 6Z" fill="${PAPER}" opacity=".7"/>
    </g>`;
  const statue = (x, y, s = 1) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      ${swanWing(-20, -330, .9, -1)}${swanWing(20, -330, .9, 1)}
      <g ${R}>
        <path d="M-40 -380 C-60 -250 -80 -120 -90 0 L90 0 C80 -120 60 -250 40 -380Z" fill="#f1f0ec" stroke="${INK}" stroke-width="4"/>
        <ellipse cx="0" cy="-410" rx="34" ry="42" fill="#f4f3ef" stroke="${INK}" stroke-width="4"/>
        <path d="M-34 -420 Q-46 -330 -40 -260 M34 -420 Q46 -330 40 -260" stroke="${INK}" stroke-width="10" fill="none"/>
        <rect x="-120" y="0" width="240" height="60" fill="url(#hatch)" stroke="${INK}" stroke-width="4"/>
      </g>
      <path d="M-60 -200 L-80 0 M60 -200 L80 0" stroke="${INK}" stroke-width="1" opacity=".5"/>
    </g>`;
  const emblem = (x, y, s = 1, c = INK) => `
    <g transform="translate(${x} ${y}) scale(${s})" ${R} fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round">
      <path d="M0 40 C-30 -10 -80 -30 -110 -10 C-80 -5 -50 20 0 40Z"/>
      <path d="M0 40 C30 -10 80 -30 110 -10 C80 -5 50 20 0 40Z"/>
      <path d="M0 40 C-15 -20 -5 -70 0 -90 C5 -70 15 -20 0 40Z"/>
      <circle cx="0" cy="58" r="10" fill="${c}"/>
    </g>`;
  const floor = (y, o = .35) => `<rect x="0" y="${y}" width="1600" height="${900 - y}" fill="url(#hatch)" opacity="${o}"/>
      ${line(0, y, 1600, y + 6, 4)}`;
  const wallBand = (y, h) => `<rect x="-20" y="${y}" width="1640" height="${h}" fill="${INK}" ${R}/>
      ${hatchRect(0, y + h, 1600, 30, 'hatchD', .8)}`;
  const arch = (x, y, w, h, fill = 'none') => `<path d="M${x} ${y + h} L${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L${x + w} ${y + h}Z" fill="${fill}" stroke="${INK}" stroke-width="6" ${R}/>`;
  const column = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e2e6e9" stroke="${INK}" stroke-width="4" ${R}/>
      <rect x="${x + w * .65}" y="${y}" width="${w * .35}" height="${h}" fill="url(#hatch)" ${R}/>`;
  const plankWall = (x0, x1, y0, y1) => {
    let o = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${PAPER2}"/>`;
    for (let x = x0; x < x1; x += 70) o += line(x, y0, x + 4, y1, 2);
    return o;
  };
  const table = (x, y, w) => `<g ${R}><rect x="${x}" y="${y}" width="${w}" height="18" fill="${INK}"/>
      <rect x="${x + 20}" y="${y}" width="14" height="110" fill="${INK}"/><rect x="${x + w - 34}" y="${y}" width="14" height="110" fill="${INK}"/></g>`;
  const bread = (x, y, s = 1, half = false) => `<g transform="translate(${x} ${y}) scale(${s})" ${R}>
      <path d="M-60 0 C-62 -38 -30 -52 0 -52 C34 -52 62 -36 60 0 Q0 12 -60 0Z" fill="#cfc6b6" stroke="${INK}" stroke-width="4"/>
      <path d="M-34 -26 l14 -6 M-6 -34 l14 -4 M22 -28 l12 -3" stroke="${INK}" stroke-width="3"/>
      ${half ? `<path d="M0 -54 L-6 -30 L6 -14 L0 6" stroke="${PAPER}" stroke-width="10" fill="none"/><path d="M0 -54 L-6 -30 L6 -14 L0 6" stroke="${INK}" stroke-width="3" fill="none"/>` : ''}</g>`;
  const eye = (x, y, s = 1, red = false) => `<g transform="translate(${x} ${y}) scale(${s})" ${R}>
      <path d="M-60 0 Q0 -46 60 0 Q0 46 -60 0Z" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
      <circle r="22" fill="${INK}"/><circle r="8" fill="${red ? RED : '#000'}"/><circle cx="-7" cy="-7" r="4" fill="${PAPER}"/>
      <path d="M-50 -14 L-60 -30 M-25 -30 L-30 -48 M0 -34 L0 -54 M25 -30 L30 -48 M50 -14 L60 -30" stroke="${INK}" stroke-width="3"/></g>`;
  const fog = (o = .6) => `<rect width="1600" height="900" fill="#fff" opacity="${o}" filter="url(#smudge)"/>`;
  const machines = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" ${R} fill="none" stroke="${INK}">
      <circle cx="0" cy="0" r="70" stroke-width="10" stroke-dasharray="22 12"/><circle cx="0" cy="0" r="22" fill="${INK}"/>
      <circle cx="110" cy="60" r="44" stroke-width="8" stroke-dasharray="14 10"/><circle cx="110" cy="60" r="12" fill="${INK}"/>
      <path d="M-120 120 L220 120 M-100 120 L-100 -80 M200 120 L200 -40" stroke-width="7"/>
      <path d="M-90 -60 C-40 -120 40 -120 90 -80" stroke-width="5"/></g>`;

  const wrap = (inner, extra = '') => `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" ${extra}>${inner}</svg>`;

  // ---------- 배경 ----------
  const BG = {
    white: () => paper('#f4f3ef'),
    black: () => paper('#050505'),
    prayer: () => paper('#efeee9') + sun(800, 40, 60) + smudge(800, 900, 900, 200, .3)
      + crowd(500, 9, .9, 120, 1480) + crowd(640, 8, 1.25, 60, 1540) + crowd(820, 7, 1.7, -40, 1640),
    island: () => paper('#ecebe6') + sun(1280, 140, 70)
      + `<path d="M180 560 C260 760 520 860 800 880 C1080 860 1340 760 1420 560Z" fill="${INK}" ${R}/>`
      + hatchRect(200, 560, 1200, 60, 'hatchD')
      + `<rect x="240" y="380" width="1120" height="180" fill="#2a2a2a" ${R}/>`
      + `<g ${R}><rect x="740" y="160" width="60" height="230" fill="#e9eaea" stroke="${INK}" stroke-width="5"/><path d="M730 160 L770 90 L810 160Z" fill="${INK}"/></g>`
      + statue(980, 380, .55)
      + `<path d="M0 800 Q200 760 400 800 T800 800 T1200 800 T1600 800 L1600 900 L0 900Z" fill="#fff" opacity=".85" filter="url(#smudge)"/>`,
    distribution: () => plankWall(0, 1600, 0, 900) + emblem(800, 180, 1.2)
      + `<rect x="560" y="330" width="480" height="200" fill="#bdb8ae" stroke="${INK}" stroke-width="6" ${R}/>` + hatchRect(560, 330, 480, 200, 'hatchD', .5)
      + table(520, 530, 560) + floor(700, .45)
      + crowd(760, 6, 1.15, 0, 520) + crowd(780, 5, 1.2, 1100, 1650) + smudge(800, 880, 900, 120, .35),
    distribution_out: () => paper('#e8e6e0') + sun(260, 110, 50) + wallBand(240, 420)
      + (() => { let b = ''; for (let y = 270; y < 650; y += 50) for (let x = (y / 50 % 2) * 60; x < 1600; x += 120) b += `<rect x="${x}" y="${y}" width="112" height="42" fill="none" stroke="#555" stroke-width="2" ${R}/>`; return b; })()
      + floor(660, .4),
    plaza: () => paper('#ecebe6') + sun(1340, 90, 55) + statue(800, 640, 1)
      + floor(640, .3) + crowd(760, 10, 1.05, -40, 1640) + crowd(900, 8, 1.5, -80, 1680),
    plaza_mourning: () => paper('#dcdad4') + statue(800, 600, .85) + floor(600, .45)
      + `<g ${R}><rect x="690" y="440" width="220" height="280" fill="${PAPER}" stroke="${INK}" stroke-width="10"/>
         <ellipse cx="800" cy="560" rx="58" ry="74" fill="none" stroke="${INK}" stroke-width="4"/>
         <path d="M742 540 Q800 450 858 540 L866 640 M742 540 L736 640" stroke="${INK}" stroke-width="6" fill="none"/>
         <path d="M720 720 L700 820 M880 720 L900 820" stroke="${INK}" stroke-width="8"/></g>`
      + crowd(820, 12, 1.15, -60, 1660) + smudge(800, 450, 900, 500, .25),
    tree: () => paper('#ecebe6') + sun(1180, 70, 40) + wallBand(120, 640)
      + `<g ${R}><path d="M300 900 C320 700 280 560 340 420 C380 330 300 260 220 240 M340 420 C420 360 520 360 560 300 M330 520 C220 500 160 440 120 380"
           stroke="${INK}" stroke-width="40" fill="none" stroke-linecap="round"/>
         <path d="M220 240 C140 230 100 200 60 160 M560 300 C620 250 660 260 700 230" stroke="${INK}" stroke-width="16" fill="none"/></g>`
      + floor(780, .4),
    tree_fog: () => BG.tree() + fog(.75),
    sun: () => paper('#eef1f3') + sun(800, 260, 90)
      + `<g ${R}><path d="M0 760 L1600 740 L1600 900 L0 900Z" fill="${INK}"/></g>`
      + figure(720, 760, .9) + figure(840, 760, .9),
    cathedral: () => paper(COLD) + column(120, 0, 120, 900) + column(1360, 0, 120, 900)
      + arch(420, 60, 760, 700, '#eef3f6') + swanWing(760, 300, 1.25, -1) + swanWing(840, 300, 1.25, 1)
      + floor(760, .35) + smudge(800, 120, 500, 120, .15),
    cathedral_out: () => paper('#e6e7e6') + arch(560, 120, 480, 560, INK) + emblem(800, 300, .9, PAPER)
      + `<g ${R}><rect x="380" y="680" width="840" height="40" fill="url(#hatch)" stroke="${INK}" stroke-width="3"/><rect x="320" y="720" width="960" height="40" fill="url(#hatch)" stroke="${INK}" stroke-width="3"/></g>`
      + floor(760, .4) + crowd(860, 4, 1.4, -60, 380) + crowd(860, 4, 1.4, 1220, 1660),
    hut: () => paper('#e6e4de') + fog(.35)
      + `<g ${R}><path d="M520 380 L800 180 L1080 380Z" fill="${INK}"/><rect x="560" y="380" width="480" height="380" fill="#d3cfc6" stroke="${INK}" stroke-width="6"/>
         <rect x="740" y="520" width="120" height="240" fill="${INK}"/><rect x="610" y="440" width="90" height="80" fill="${INK}" opacity=".8"/></g>`
      + hatchRect(560, 380, 480, 380, 'hatch', .5) + floor(760, .4),
    soya_room: () => plankWall(0, 1600, 0, 900) + `<rect x="1120" y="140" width="220" height="200" fill="#f4f6f8" stroke="${INK}" stroke-width="8" ${R}/>`
      + line(1230, 140, 1230, 340, 5) + line(1120, 240, 1340, 240, 5)
      + `<g ${R}><rect x="120" y="520" width="520" height="90" fill="#efeee9" stroke="${INK}" stroke-width="6"/><rect x="120" y="440" width="60" height="230" fill="${INK}"/><rect x="600" y="520" width="40" height="150" fill="${INK}"/></g>`
      + table(860, 560, 360) + bread(1040, 556, .9, true) + floor(680, .45) + smudge(300, 700, 300, 40, .4),
    alley: () => paper('#d8d6d0')
      + `<path d="M0 0 L620 260 L620 760 L0 900Z" fill="${INK}" ${R}/><path d="M1600 0 L980 260 L980 760 L1600 900Z" fill="#2c2c2c" ${R}/>`
      + hatchRect(620, 260, 360, 500, 'hatchD', .35) + `<path d="M620 760 L980 760 L1600 900 L0 900Z" fill="url(#hatch)" opacity=".6"/>`
      + `<g ${R}><rect x="700" y="680" width="70" height="80" fill="${INK}"/><rect x="790" y="700" width="50" height="60" fill="#333"/></g>`,
    chabi_room: () => paper('#cfccc5') + `<rect x="740" y="120" width="40" height="300" fill="#fbfdff" ${R}/>`
      + `<path d="M760 120 L520 900 L1000 900Z" fill="#fff" opacity=".35" filter="url(#smudge)"/>`
      + `<g ${R}><rect x="160" y="560" width="440" height="80" fill="#e9e7e1" stroke="${INK}" stroke-width="6"/><rect x="160" y="500" width="40" height="200" fill="${INK}"/></g>`
      + table(1000, 600, 300) + floor(700, .5) + smudge(800, 450, 900, 500, .3),
    canteen: () => plankWall(0, 1600, 0, 900) + emblem(800, 150, .9)
      + `<path d="M200 520 L1400 520 L1600 700 L0 700Z" fill="${INK}" ${R}/><path d="M100 760 L1500 760 L1600 840 L0 840Z" fill="${INK}" ${R}/>`
      + crowd(520, 10, .75, 220, 1380) + crowd(760, 9, 1.05, 60, 1540) + bread(500, 700, .5) + bread(1100, 700, .5),
    hall: () => paper(COLD) + column(80, 0, 90, 900) + column(1430, 0, 90, 900)
      + `<rect x="700" y="300" width="200" height="160" fill="${INK}" ${R}/>` + figure(800, 300, .8, { robe: '#333' })
      + crowd(560, 9, .9, 160, 1440) + crowd(700, 8, 1.2, 100, 1500) + crowd(900, 7, 1.6, 40, 1560),
    hall_hands: () => paper(COLD) + column(80, 0, 90, 900) + column(1430, 0, 90, 900)
      + `<rect x="700" y="300" width="200" height="160" fill="${INK}" ${R}/>` + figure(800, 300, .8, { robe: '#333' })
      + crowd(560, 9, .9, 160, 1440, { hands: .9 }) + crowd(700, 8, 1.2, 100, 1500, { hands: .9 }) + crowd(900, 7, 1.6, 40, 1560, { hands: .75 }),
    hall_turned: () => paper('#d5dbe0') + column(80, 0, 90, 900) + column(1430, 0, 90, 900)
      + crowd(560, 9, .9, 160, 1440, { faces: true }) + crowd(700, 8, 1.2, 100, 1500, { faces: true })
      + `<g ${R}><path d="M640 900 C650 720 700 640 800 630 C900 640 950 720 960 900Z" fill="#f2f1ec" stroke="${INK}" stroke-width="5"/>
         <path d="M690 900 C680 700 700 560 800 540 C900 560 920 700 910 900" fill="${INK}"/></g>`
      + smudge(800, 900, 700, 200, .3),
    purify_room: () => paper('#c9c7c1') + smudge(800, 450, 900, 500, .45)
      + `<path d="M800 0 L560 900 L1040 900Z" fill="#fff" opacity=".18" filter="url(#smudge)"/>`
      + `<g ${R}><rect x="620" y="560" width="360" height="20" fill="${INK}"/><rect x="640" y="580" width="16" height="200" fill="${INK}"/><rect x="944" y="580" width="16" height="200" fill="${INK}"/>
         <rect x="740" y="440" width="120" height="20" fill="${INK}"/><rect x="740" y="460" width="16" height="320" fill="${INK}"/><rect x="844" y="460" width="16" height="320" fill="${INK}"/><rect x="740" y="300" width="120" height="16" fill="${INK}"/><rect x="740" y="300" width="16" height="160" fill="${INK}"/><rect x="844" y="300" width="16" height="160" fill="${INK}"/></g>`
      + floor(780, .5),
    purify_distort: () => BG.purify_room() + `<rect width="1600" height="900" fill="${RED}" opacity=".07"/>`,
    corridor_empty: () => paper('#d8dbdd') + `<path d="M0 0 L640 300 L640 600 L0 900Z" fill="#9a9c9e" ${R}/><path d="M1600 0 L960 300 L960 600 L1600 900Z" fill="#8a8c8e" ${R}/>`
      + `<rect x="640" y="300" width="320" height="300" fill="#eef1f3" ${R}/>` + `<path d="M640 600 L960 600 L1600 900 L0 900Z" fill="url(#hatch)" opacity=".5"/>`
      + (() => { let s = ''; for (let i = 0; i < 6; i++) { const t = i / 6; s += line(640 * t, 900 - 300 * t, 640 * t, 300 * t + 0, 2) + line(1600 - 640 * t, 900 - 300 * t, 1600 - 640 * t, 300 * t, 2); } return s; })(),
    corridor: () => paper(COLD) + `<path d="M0 0 L700 330 L700 600 L0 900Z" fill="#b9c2c9" ${R}/><path d="M1600 0 L900 330 L900 600 L1600 900Z" fill="#aab3ba" ${R}/>`
      + `<rect x="700" y="330" width="200" height="270" fill="#f3f6f8" stroke="${INK}" stroke-width="5" ${R}/>` + swanWing(790, 450, .25, -1) + swanWing(810, 450, .25, 1)
      + `<path d="M700 600 L900 600 L1600 900 L0 900Z" fill="url(#hatch)" opacity=".4"/>`,
    door_swan: () => paper('#e3e8ec') + `<rect x="480" y="60" width="640" height="840" fill="#f4f6f7" stroke="${INK}" stroke-width="10" ${R}/>`
      + line(800, 60, 800, 900, 6) + swanWing(780, 380, .9, -1) + swanWing(820, 380, .9, 1) + emblem(800, 560, .6)
      + `<circle cx="760" cy="620" r="14" fill="${INK}"/><circle cx="840" cy="620" r="14" fill="${INK}"/>` + smudge(800, 900, 700, 80, .35),
    mother_room: () => paper('#e4e9ed')
      + arch(560, 40, 460, 520, '#f6f9fb') + sun(790, 260, 80, true) + machines(1020, 150, .6)
      + line(560, 300, 1020, 300, 4) + line(790, 40, 790, 560, 4)
      + swanWing(240, 230, .45, -1) + swanWing(260, 230, .45, 1)
      + `<g ${R}><rect x="190" y="560" width="440" height="30" fill="${INK}"/><rect x="210" y="590" width="20" height="200" fill="${INK}"/><rect x="590" y="590" width="20" height="200" fill="${INK}"/>
         <rect x="240" y="500" width="120" height="60" fill="#cfc8ba" stroke="${INK}" stroke-width="4"/><rect x="380" y="520" width="150" height="40" fill="#b8b1a3" stroke="${INK}" stroke-width="4"/><path d="M548 560 L556 480 L584 480 L590 560" fill="${RED}" opacity=".85"/></g>`
      + `<g ${R}><rect x="1060" y="570" width="230" height="150" fill="#9b8f7c" stroke="${INK}" stroke-width="6"/><rect x="1060" y="570" width="230" height="40" fill="${INK}"/><rect x="1160" y="620" width="30" height="40" fill="${PAPER}" stroke="${INK}" stroke-width="4"/></g>`
      + `<g ${R}><rect x="1360" y="130" width="190" height="440" rx="90" fill="#cfd6db" stroke="${INK}" stroke-width="10"/><path d="M1400 200 L1500 420" stroke="#fff" stroke-width="10" opacity=".7"/></g>`
      + floor(780, .4) + machines(120, 850, .5),
    mother_room_dark: () => paper('#0b0b0b') + `<circle cx="800" cy="520" r="420" fill="#d8cdb6" opacity=".35" filter="url(#smudge)"/>`
      + `<g ${R}><rect x="460" y="600" width="680" height="30" fill="#000"/><rect x="520" y="540" width="200" height="60" fill="#cfc4ad"/><rect x="760" y="550" width="260" height="50" fill="#bfb49e"/>
         <rect x="1080" y="520" width="14" height="80" fill="#efe6d2"/><path d="M1087 520 q-10 -24 0 -40 q10 16 0 40" fill="#e8c27a"/></g>`,
    hidden_door: () => paper('#cfd4d8') + smudge(800, 450, 900, 500, .4)
      + `<rect x="620" y="140" width="360" height="680" fill="${INK}" ${R}/><rect x="790" y="140" width="20" height="680" fill="#fff" opacity=".9" filter="url(#smudge)"/>`
      + `<circle cx="760" cy="500" r="16" fill="#fff"/>` + `<path d="M760 500 L560 900 L1040 900Z" fill="#fff" opacity=".12"/>`,
    threshold: () => paper('#0e0e0e') + `<path d="M520 0 L1080 0 L1180 640 L420 640Z" fill="#f8fbfd" filter="url(#smudge)"/>`
      + `<path d="M380 640 L1220 640 L1600 900 L0 900Z" fill="#2a2a2a" ${R}/>` + line(380, 640, 1220, 640, 8, '#ddd')
      + `<g ${R}><path d="M620 900 L640 760 Q660 700 720 700 L760 700 Q790 720 780 780 L770 900Z" fill="${INK}" stroke="#555" stroke-width="3"/>
         <path d="M980 900 L960 760 Q940 700 880 700 L840 700 Q810 720 820 780 L830 900Z" fill="${INK}" stroke="#555" stroke-width="3"/>
         <path d="M600 760 Q800 700 1000 760 L1040 620 Q800 560 560 620Z" fill="#f3f2ee" opacity=".9"/></g>`,
    wing_hall: () => paper('#f3f6f8') + `<circle cx="800" cy="420" r="520" fill="url(#sunGlow)"/>` + swanWing(780, 380, 2.1, -1) + swanWing(820, 380, 2.1, 1) + floor(800, .25),
    wing_hall_bare: () => paper('#e6eaec') + `<circle cx="800" cy="420" r="520" fill="url(#sunGlow)" opacity=".6"/>` + smudge(800, 300, 600, 300, .18) + floor(800, .3),
    two_paths: () => paper('#dfe5e9') + arch(160, 160, 420, 640, '#8a9196') + arch(1020, 160, 420, 640, '#fbfdfe')
      + `<rect x="1060" y="390" width="340" height="410" fill="#fff" opacity=".8" filter="url(#smudge)"/>` + column(250, 380, 40, 420) + column(450, 380, 40, 420)
      + floor(800, .35),
    embrace: () => paper('#efefec') + `<circle cx="800" cy="460" r="460" fill="url(#sunGlow)"/>`
      + swanWing(800, 420, 1.6, -1) + swanWing(800, 420, 1.6, 1)
      + `<g ${R}><path d="M700 900 C700 700 740 560 800 540 C860 560 900 700 900 900Z" fill="#f7f6f2" stroke="${INK}" stroke-width="5"/>
         <path d="M740 900 C730 680 750 520 800 500 C850 520 870 680 860 900" fill="${INK}"/></g>`
  };

  // ---------- 캐릭터 스탠딩 (viewBox 400x900) ----------
  const face = (cx, cy, rx, ry, o = {}) => `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${o.skin || '#f3f1ec'}" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="${cx - rx * .38}" cy="${cy + 4}" rx="${o.eye || 9}" ry="${(o.eye || 9) * 1.05}" fill="${INK}"/>
    <ellipse cx="${cx + rx * .38}" cy="${cy + 4}" rx="${o.eye || 9}" ry="${(o.eye || 9) * 1.05}" fill="${INK}"/>
    <circle cx="${cx - rx * .38 - 2}" cy="${cy}" r="2.4" fill="#fff"/><circle cx="${cx + rx * .38 - 2}" cy="${cy}" r="2.4" fill="#fff"/>
    ${o.mouth === 'smile' ? `<path d="M${cx - 36} ${cy + 30} Q${cx} ${cy + 64} ${cx + 36} ${cy + 30}" stroke="${INK}" stroke-width="4" fill="${RED}"/>` :
      o.mouth === 'none' ? '' : `<path d="M${cx - 8} ${cy + 34} Q${cx} ${cy + 37} ${cx + 8} ${cy + 34}" stroke="${INK}" stroke-width="2.5" fill="none"/>`}`;
  const dress = (o = {}) => `<path d="M150 300 C120 420 90 640 70 800 L330 800 C310 640 280 420 250 300 Q200 286 150 300Z" fill="${o.c || '#f5f4f0'}" stroke="${INK}" stroke-width="4"/>
    <path d="M170 360 C150 520 130 660 120 790 M230 360 C250 520 270 660 280 790" stroke="${INK}" stroke-width="1.6" opacity=".55" fill="none"/>
    <path d="M140 300 C110 360 100 460 110 540 M260 300 C290 360 300 460 290 540" stroke="${INK}" stroke-width="22" stroke-linecap="round" fill="none" opacity="${o.armo || 0}"/>`;
  const boots = `<path d="M140 800 L132 880 L196 880 L192 800Z M210 800 L206 880 L270 880 L262 800Z" fill="${INK}"/>`;
  const CH = {
    soya: () => `<g ${R}>${dress()}${boots}
      <path d="M128 140 C120 70 170 40 200 40 C232 40 282 70 274 140 L286 300 L250 300 L246 170 L154 170 L150 300 L114 300Z" fill="#4a4a4a"/>
      ${face(200, 170, 56, 66)}
      <path d="M144 130 C160 96 240 96 258 130 L258 150 C230 120 170 120 144 150Z" fill="#4a4a4a"/>
      <path d="M150 300 L250 300" stroke="${INK}" stroke-width="3"/></g>`,
    soya_far: () => `<g transform="translate(120 330) scale(.6)">${CH.soya()}</g>`,
    mira: () => `<g ${R}>${dress({ c: '#d9d5cc' })}<path d="M120 420 L280 420 L300 800 L100 800Z" fill="url(#hatch)" opacity=".7"/>
      <path d="M140 800 L140 880 L260 880 L260 800Z" fill="${INK}"/>
      <path d="M124 180 C110 80 290 80 276 180 L292 330 L108 330Z" fill="#9a958c" stroke="${INK}" stroke-width="4"/>
      ${face(200, 180, 52, 62, { eye: 7 })}
      <path d="M148 170 Q200 140 252 170" stroke="${INK}" stroke-width="3" fill="none"/></g>`,
    manager: () => `<g ${R}><path d="M130 250 C110 420 100 650 90 880 L310 880 C300 650 290 420 270 250 Q200 230 130 250Z" fill="${INK}"/>
      <path d="M150 250 L200 380 L250 250" stroke="#555" stroke-width="5" fill="none"/>
      <rect x="166" y="210" width="68" height="50" fill="#2b2b2b"/>
      ${face(200, 150, 48, 60, { eye: 5, skin: '#e6e4df' })}
      <path d="M140 110 L260 110 L250 80 L150 80Z" fill="${INK}"/><rect x="128" y="104" width="144" height="14" fill="${INK}"/>
      <rect x="250" y="460" width="56" height="72" fill="#dcd8cf" stroke="${INK}" stroke-width="3"/></g>`,
    elder: () => `<g ${R} transform="translate(0 60)"><path d="M140 300 C100 420 90 640 90 820 L290 820 C300 640 280 440 240 300Z" fill="#6b6760" stroke="${INK}" stroke-width="4"/>
      ${face(180, 230, 46, 54, { eye: 5 })}<path d="M134 210 Q180 150 228 210" stroke="#ccc" stroke-width="14" fill="none"/>
      <path d="M300 300 L250 840" stroke="${INK}" stroke-width="9"/><path d="M230 820 L300 840 L240 860Z" fill="${INK}"/></g>`,
    child: () => `<g ${R} transform="translate(60 330) scale(.7)">${dress({ c: '#e7e5df' })}${boots}
      <path d="M140 150 C130 90 270 90 260 150 L262 230 L138 230Z" fill="#3b3b3b"/>${face(200, 175, 52, 58)}</g>`,
    chabi_wings: () => `<g transform="translate(0 0)">
      <g transform="translate(200 360) scale(.35)">${roachWing(0, 0, 1, -1)}${roachWing(0, 0, 1, 1)}</g>
      <g ${R}>${dress()}${boots}
      <path d="M120 140 C110 60 290 60 280 140 L300 820 L250 820 L250 200 L150 200 L150 820 L100 820Z" fill="${INK}"/>
      ${face(200, 165, 54, 64, { eye: 12 })}
      <path d="M140 150 L140 110 C170 92 230 92 260 110 L260 150Z" fill="${INK}"/></g></g>`,
    mother: (o = {}) => `<g transform="translate(200 330)">${o.true ? roachWing(-40, 0, 1.5, -1) + roachWing(40, 0, 1.5, 1) : swanWing(-40, 0, 1.3, -1) + swanWing(40, 0, 1.3, 1)}</g>
      <g ${R}>
      <path d="M140 260 C100 480 60 700 30 890 L370 890 C340 700 300 480 260 260Z" fill="#efeeea" stroke="${INK}" stroke-width="4"/>
      <path d="M30 890 L60 850 L80 890 L110 840 L140 890 L170 850 L200 890 L230 845 L260 890 L290 850 L320 890 L350 855 L370 890" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <path d="M128 120 C110 20 290 20 272 120 L310 760 L250 760 L250 200 L150 200 L150 760 L90 760Z" fill="${INK}"/>
      ${face(200, 150, 50, 66, { eye: 6, skin: '#f8f8f6', mouth: o.mouth || 'thin' })}
      <path d="M146 130 C160 70 240 70 254 130" stroke="${INK}" stroke-width="16" fill="none"/></g>
      ${o.shadow ? `<rect x="-300" y="0" width="1000" height="420" fill="${INK}" opacity=".0"/><ellipse cx="200" cy="160" rx="70" ry="86" fill="${INK}" opacity=".78" filter="url(#smudge)"/>` : ''}`,
    mother_shadow: () => CH.mother({ shadow: true }),
    mother_true: () => CH.mother({ true: true }),
    mother_silhouette: () => `<g opacity=".95"><g transform="translate(200 330)">${roachWing(-40, 0, 1, -1)}${roachWing(40, 0, 1, 1)}</g>
      <path d="M140 200 C100 480 60 700 30 890 L370 890 C340 700 300 480 260 200 C260 120 140 120 140 200Z" fill="#050505" ${R}/></g>`
  };
  const charWide = { mother: true, mother_shadow: true, mother_true: true };

  // ---------- 중앙 일러스트 (viewBox 800x600) ----------
  const IMG = {
    bread: () => `<rect width="800" height="600" fill="${PAPER}"/>${bread(400, 360, 3)}${smudge(400, 420, 260, 30, .3)}`,
    bread_half: () => `<rect width="800" height="600" fill="${PAPER}"/>${bread(300, 360, 2.4, true)}${bread(500, 380, 2.4, true)}
      <g ${R}><circle cx="410" cy="470" r="6" fill="#b5ab99"/><circle cx="380" cy="490" r="4" fill="#b5ab99"/><circle cx="440" cy="500" r="5" fill="#b5ab99"/></g>`,
    note_floor: () => `<rect width="800" height="600" fill="#3a3732"/><rect x="0" y="0" width="800" height="200" fill="${INK}"/>
      <g ${R} transform="rotate(-8 400 360)"><rect x="250" y="270" width="300" height="180" fill="#e9e3d6" stroke="${INK}" stroke-width="3"/>
      ${[310, 340, 370, 400].map(y => `<path d="M280 ${y} q40 -6 80 2 t80 -3 t70 4" stroke="${INK}" stroke-width="3" fill="none"/>`).join('')}</g>`,
    notebook: () => `<rect width="800" height="600" fill="#2d2b28"/><g ${R}><rect x="230" y="110" width="340" height="400" fill="#6a5f50" stroke="${INK}" stroke-width="6"/>
      <rect x="250" y="130" width="300" height="360" fill="none" stroke="#3c342b" stroke-width="3"/>${emblem(400, 300, .5, '#cbbfa9')}</g>`,
    drawing: () => `<rect width="800" height="600" fill="#efe9dc"/><g ${R2}>
      <rect x="40" y="380" width="720" height="40" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M40 380 L40 160 L760 160 L760 380" stroke="${INK}" stroke-width="4" fill="none"/>
      <path d="M60 140 Q400 -40 740 140" stroke="#3f6fa8" stroke-width="40" fill="none" opacity=".75"/>
      <circle cx="620" cy="80" r="40" fill="none" stroke="#c7a12a" stroke-width="6"/>
      <circle cx="350" cy="470" r="22" fill="none" stroke="${INK}" stroke-width="4"/><path d="M350 492 L350 560 M330 590 L350 560 L370 590 M350 515 L400 520" stroke="${INK}" stroke-width="4" fill="none"/>
      <circle cx="450" cy="470" r="22" fill="none" stroke="${INK}" stroke-width="4"/><path d="M450 492 L450 560 M430 590 L450 560 L470 590 M450 515 L400 520" stroke="${INK}" stroke-width="4" fill="none"/>
      <path d="M330 455 L370 455 M330 448 L330 520" stroke="${INK}" stroke-width="5"/></g>`,
    emblem: () => `<rect width="800" height="600" fill="${PAPER}"/>${emblem(400, 300, 2.2)}${smudge(400, 300, 300, 200, .12)}`,
    note_item: () => `<rect width="800" height="600" fill="#24221f"/><g ${R} transform="rotate(4 400 300)"><path d="M220 160 L590 150 L600 450 L210 460Z" fill="#e6dfcf" stroke="${INK}" stroke-width="3"/>
      <path d="M260 200 L330 260 M480 180 L520 300 M300 400 L560 380" stroke="#b9b1a0" stroke-width="2"/>
      ${[230, 270, 310, 350].map(y => `<path d="M260 ${y} q50 -6 100 2 t100 -3 t80 4" stroke="${INK}" stroke-width="3" fill="none"/>`).join('')}</g>`,
    desk_zoom: () => `<rect width="800" height="600" fill="#d6d1c6"/><g ${R}><rect x="100" y="140" width="600" height="380" fill="#efeadf" stroke="${INK}" stroke-width="6"/>
      <line x1="400" y1="140" x2="400" y2="520" stroke="${INK}" stroke-width="6"/>
      ${[190, 230, 270, 310, 350, 390, 430].map(y => `<path d="M140 ${y} L370 ${y} M430 ${y} L660 ${y}" stroke="#555" stroke-width="2.5"/>`).join('')}
      <circle cx="600" cy="460" r="38" fill="none" stroke="${RED}" stroke-width="7"/><path d="M580 460 L620 460 M600 440 L600 480" stroke="${RED}" stroke-width="5"/></g>`,
    window_zoom: () => `<rect width="800" height="600" fill="#e7edf1"/>${(() => '')()}<g>
      <circle cx="400" cy="300" r="300" fill="url(#sunGlow)"/><circle cx="400" cy="300" r="150" fill="#fbfdfe" stroke="${INK}" stroke-width="5" ${R}/>
      <circle cx="400" cy="300" r="190" fill="none" stroke="${INK}" stroke-width="14" stroke-dasharray="30 16" ${R}/>
      <circle cx="400" cy="300" r="240" fill="none" stroke="${INK}" stroke-width="4" ${R}/>
      ${machines(140, 470, .7)}${machines(660, 120, .55)}</g>`,
    box_zoom: () => `<rect width="800" height="600" fill="#2b2824"/><g ${R}><rect x="190" y="200" width="420" height="260" fill="#8d7f69" stroke="${INK}" stroke-width="8"/>
      <rect x="190" y="200" width="420" height="70" fill="#5b5040" stroke="${INK}" stroke-width="6"/>
      <rect x="360" y="250" width="80" height="100" rx="12" fill="#c4bba9" stroke="${INK}" stroke-width="6"/>
      <path d="M380 290 l10 -16 l10 16 M400 300 l0 26 M420 290 l-10 -16" stroke="${INK}" stroke-width="5" fill="none"/></g>`,
    photo: () => `<rect width="800" height="600" fill="#2b2824"/><g ${R} transform="rotate(-3 400 300)"><rect x="250" y="90" width="300" height="400" fill="#f1ede4" stroke="${INK}" stroke-width="3"/>
      <rect x="275" y="115" width="250" height="300" fill="#a8a296"/>
      <path d="M340 415 C340 300 360 220 400 210 C440 220 460 300 460 415Z" fill="${INK}"/>
      <ellipse cx="400" cy="240" rx="34" ry="40" fill="#e8e5dd"/><path d="M366 236 L366 222 Q400 190 434 222 L434 236Z" fill="${INK}"/>
      <circle cx="388" cy="246" r="5" fill="${INK}"/><circle cx="412" cy="246" r="5" fill="${INK}"/>
      <path d="M370 300 L430 300 L440 415 L360 415Z" fill="#f4f3ef"/></g>`,
    mirror_zoom: () => `<rect width="800" height="600" fill="#bfc6cb"/><g ${R}><rect x="230" y="40" width="340" height="520" rx="160" fill="#dfe5e8" stroke="${INK}" stroke-width="12"/></g>
      ${swanWing(390, 280, .55, -1)}${swanWing(410, 280, .55, 1)}<g opacity=".55">${roachWing(390, 290, .5, -1)}${roachWing(410, 290, .5, 1)}</g>
      <g ${R}><path d="M520 540 l40 -14 l-6 30Z" fill="#3e3427" opacity=".8"/></g>`,
    mirror_mother: () => `<rect width="800" height="600" fill="#bfc6cb"/><g ${R}><rect x="230" y="40" width="340" height="520" rx="160" fill="#d2d9dd" stroke="${INK}" stroke-width="12"/></g>
      <g transform="translate(270 110) scale(.34)">${CH.mother()}</g>
      <g ${R}><path d="M330 600 C330 470 360 400 400 390 C440 400 470 470 470 600Z" fill="${INK}"/></g>`,
    mirror_manager: () => `<rect width="800" height="600" fill="#bfc6cb"/><g ${R}><rect x="230" y="40" width="340" height="520" rx="160" fill="#c8ced2" stroke="${INK}" stroke-width="12"/></g>
      <g transform="translate(320 120) scale(.42)">${CH.manager()}</g>
      <g ${R}><path d="M330 600 C330 470 360 400 400 390 C440 400 470 470 470 600Z" fill="${INK}"/></g>`,
    fragment: () => `<rect width="800" height="600" fill="#d8d4cc"/>${roachWing(300, 330, .9, 1)}${smudge(420, 420, 260, 30, .3)}`,
    mother_face: () => `<rect width="800" height="600" fill="#050505"/><g ${R}>
      <path d="M180 0 C120 200 120 400 160 600 L640 600 C680 400 680 200 620 0Z" fill="${INK}"/>
      <ellipse cx="400" cy="300" rx="190" ry="250" fill="#f8f8f6"/>
      <ellipse cx="330" cy="260" rx="16" ry="20" fill="${INK}"/><ellipse cx="470" cy="260" rx="16" ry="20" fill="${INK}"/>
      <path d="M260 220 C300 120 500 120 540 220" stroke="${INK}" stroke-width="30" fill="none"/></g>`,
    mother_face_smile: () => IMG.mother_face().replace('</g>', `<path d="M250 380 Q400 560 550 380 Q400 450 250 380Z" fill="${RED}" stroke="${INK}" stroke-width="6"/>
      ${[290, 330, 370, 410, 450, 490].map(x => `<path d="M${x} ${395 + Math.abs(x - 400) * -.1} l10 28 l10 -28" fill="#fff"/>`).join('')}</g>`),
    eyes: () => `<rect width="800" height="600" fill="none"/>`
  };

  // 아이템 아이콘 (viewBox 100x100)
  const ICON = {
    note: `<g ${R}><path d="M18 22 L82 16 L86 80 L14 84Z" fill="#e6dfcf" stroke="${INK}" stroke-width="3"/><path d="M26 40 q15 -3 30 0 t26 -1 M26 54 q15 -3 30 0 t26 -1 M26 68 q14 -3 28 0" stroke="${INK}" stroke-width="2.5" fill="none"/></g>`,
    emblem: `<g transform="translate(50 52) scale(.38)">${emblem(0, 0, 1)}</g>`,
    notebook: `<g ${R}><rect x="22" y="14" width="56" height="72" fill="#6a5f50" stroke="${INK}" stroke-width="4"/></g><g transform="translate(50 50) scale(.18)">${emblem(0, 0, 1, '#d8cdb6')}</g>`,
    ledger: `<g ${R}><rect x="14" y="20" width="72" height="60" fill="#efeadf" stroke="${INK}" stroke-width="4"/><line x1="50" y1="20" x2="50" y2="80" stroke="${INK}" stroke-width="4"/><circle cx="72" cy="68" r="8" fill="none" stroke="${RED}" stroke-width="3"/></g>`,
    plate: `<g ${R}><rect x="12" y="32" width="76" height="36" fill="#a7adb1" stroke="${INK}" stroke-width="4"/><path d="M22 44 L70 44 M22 56 L60 56" stroke="${INK}" stroke-width="3"/><circle cx="18" cy="50" r="2" fill="${INK}"/><circle cx="82" cy="50" r="2" fill="${INK}"/></g>`,
    photo: `<g ${R}><rect x="24" y="12" width="52" height="72" fill="#f1ede4" stroke="${INK}" stroke-width="3"/><rect x="29" y="17" width="42" height="50" fill="#a8a296"/><path d="M40 67 C40 50 44 38 50 37 C56 38 60 50 60 67Z" fill="${INK}"/><circle cx="50" cy="40" r="6" fill="#eee"/></g>`,
    letter: `<g ${R}><rect x="16" y="26" width="68" height="48" fill="#efe9dc" stroke="${INK}" stroke-width="3"/><path d="M16 26 L50 54 L84 26" stroke="${INK}" stroke-width="3" fill="none"/></g>`,
    fragment: `<g transform="translate(16 62) scale(.2)">${roachWing(0, 0, 1, 1)}</g>`
  };

  // 지도 (viewBox 1000x700)
  const MAP = () => `<svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <rect width="1000" height="700" fill="#e7e4dc"/>
    <path d="M90 360 C80 160 300 50 500 50 C720 50 930 160 910 380 C900 560 720 670 500 670 C280 670 100 560 90 360Z" fill="#dcd8cf" stroke="${INK}" stroke-width="18" ${R}/>
    <path d="M120 360 C110 190 310 80 500 80 C700 80 890 190 880 380 C870 540 700 640 500 640 C300 640 130 540 120 360Z" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="10 8" ${R}/>
    <path d="M500 150 L500 330 L280 410 M500 330 L700 410 M500 330 L600 490 L340 570 M500 330 L220 240 M500 330 L760 240" stroke="#8b867c" stroke-width="10" fill="none" stroke-linecap="round" ${R}/>
    <g transform="translate(500 330) scale(.12)">${statue(0, 0, 1)}</g>
    <g ${R}><rect x="470" y="95" width="60" height="70" fill="${INK}"/><path d="M462 95 L500 50 L538 95Z" fill="${INK}"/></g>
    <circle cx="790" cy="30" r="22" fill="#f7fafc" stroke="#8ea2b3" stroke-width="3"/>
    </svg>`;

  return {
    bg: id => BG[id] ? wrap(BG[id]()) : wrap(paper()),
    ch: id => CH[id] ? `<svg viewBox="${charWide[id] ? '-300 0 1000 900' : '0 0 400 900'}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" overflow="visible">${CH[id]()}</svg>` : '',
    chWide: id => !!charWide[id],
    img: id => IMG[id] ? `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">${IMG[id]()}</svg>` : '',
    icon: id => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${ICON[id] || ''}</svg>`,
    eye: (s, red) => `<svg viewBox="-70 -60 140 120" xmlns="http://www.w3.org/2000/svg">${eye(0, 0, s, red)}</svg>`,
    map: MAP,
    has: { bg: id => !!BG[id], ch: id => !!CH[id], img: id => !!IMG[id] }
  };
})();
