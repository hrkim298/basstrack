# BassTrack

베이스 연습곡과 진행 상황을 관리하는 순수 HTML, CSS, JavaScript 웹 애플리케이션입니다.

## 기술 구성

- HTML5
- CSS3
- Vanilla JavaScript
- 브라우저 LocalStorage

외부 라이브러리, 외부 폰트, 빌드 도구, npm 패키지를 사용하지 않습니다.

## 주요 기능

- 연습곡 목록 관리
- 곡 정보 수정 및 삭제
- 곡별 상태 추적
- 진행 상황 기록
- 연습 메모 즉시 추가 및 삭제
- 곡명 및 아티스트 검색
- 반응형 화면
- LocalStorage 데이터 저장

## 실행 방법

`index.html`을 브라우저에서 직접 열거나 정적 파일 서버를 사용합니다.

```bash
python -m http.server 3000
```

그 후 `http://localhost:3000`에 접속합니다.

## 프로젝트 구조

```text
basstrack/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 데이터 저장

모든 데이터는 브라우저의 LocalStorage에 저장됩니다.

- 저장 키: `basstrack_songs_data_v1`
- 서버 및 데이터베이스 불필요
- 브라우저 사이트 데이터를 삭제하면 저장 데이터도 삭제될 수 있음
