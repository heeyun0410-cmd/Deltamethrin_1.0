# DELTAMETHRIN (델타메트린)

심리 어드벤처 비주얼 노벨 · PC 웹 브라우저 · 약 20분

## 실행
`index.html`을 브라우저(Chrome 권장)로 열면 바로 플레이할 수 있습니다. 빌드가 필요 없습니다.

## 구조
```
index.html              화면 골격
css/style.css           디자인 시스템 (흑백 목탄 · 적색은 위기 순간에만)
js/data/story.js        ★ 전체 대사 · 연출 · 선택지 · 지도 위치 (시나리오 Ver. 2.0 기준)
js/data/items.js        소지품(단서) 데이터
js/data/assets.js       ★ 이미지/사운드 교체 표 — 경로만 적으면 임시 에셋 대신 사용
js/data/art.js          임시 목탄 스케치 (SVG)
js/engine/runner.js     스크립트 실행기 (프레임 스택, 저장 지점)
js/engine/state.js      상태 · 순응도 · 저장/불러오기 · 설정
js/engine/ui.js         대화창 · 문서 · 팝업 · 인벤토리 · 메뉴 · 엔딩
js/engine/choices.js    선택지 간섭 연출 (선택 05·06·08·11·14·15·19)
js/engine/interactions.js 지도 · 포인트 앤 클릭 조사 · 스페이스 바 상호작용
js/engine/scene3d.js    3D 1인칭 (선택 20)
js/engine/audio.js      합성 BGM/효과음 (파일 지정 시 파일 우선)
js/main.js              타이틀 · 부팅
```

## 조작
Space/Enter 진행 · 방향키 선택 · I 소지품 · Esc 메뉴 · L 기록 · A 자동 진행

## 에셋 교체
`js/data/assets.js`에서 키에 파일 경로를 지정합니다. 예) `BACKGROUNDS.plaza = 'assets/bg/plaza.png'`
