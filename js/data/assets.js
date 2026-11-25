/* =====================================================================
   DELTAMETHRIN — 에셋 교체 표
   ---------------------------------------------------------------------
   기본값은 모두 null → 임시 SVG 일러스트(js/data/art.js)와
   합성 사운드(js/engine/audio.js)를 사용합니다.
   실제 파일이 준비되면 경로만 적어 주세요. 예)
     BACKGROUNDS.plaza = 'assets/bg/plaza.png';
     CHARACTERS.mother = 'assets/ch/mother.png';
     BGM.daily = 'assets/audio/bgm_daily.mp3';
     SFX.bell  = 'assets/audio/sfx_bell.ogg';
   ===================================================================== */
const ASSETS = {
  BACKGROUNDS: {
    // white, black, prayer, island, distribution, distribution_out, plaza, plaza_mourning,
    // tree, tree_fog, sun, cathedral, cathedral_out, hut, soya_room, alley, chabi_room,
    // canteen, hall, hall_hands, hall_turned, purify_room, purify_distort, corridor_empty,
    // corridor, door_swan, mother_room, mother_room_dark, hidden_door, threshold,
    // wing_hall, two_paths, embrace
  },
  CHARACTERS: {
    // soya, soya_far, mira, manager, elder, child, chabi_wings,
    // mother, mother_shadow, mother_true, mother_silhouette
  },
  ILLUSTRATIONS: {
    // bread, bread_half, note_floor, notebook, drawing, emblem, note_item, desk_zoom,
    // window_zoom, box_zoom, photo, mirror_zoom, mirror_mother, mirror_manager,
    // fragment, mother_face, mother_face_smile
  },
  ITEM_ICONS: {
    // note, emblem, notebook, ledger, plate, photo, letter, fragment
  },
  BGM: {
    // prayer, daily, quiet, cathedral, whisper, death, purify, purify_prayer,
    // machine, mother_room, heartbeat, wings, final, ending, title
  },
  SFX: {
    // text, click, confirm, warn, bell, bell_low, bell_far, whisper, paper, machine,
    // wing, glitch, knock, door, thud, applause, applause_fade, steps, tear, pen,
    // box_open, burn, item, prayer_low, step3d, hold
  }
};
