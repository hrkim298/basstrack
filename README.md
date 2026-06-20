# BassTrack

BassTrack은 연습곡의 진행 상태, 연습 정보, 메모를 브라우저에 저장해 관리하는 정적 웹 애플리케이션입니다.

## 주요 기능

- 연습곡 목록 보기
- 곡명 또는 아티스트명 검색
- 상태별 필터링: 전체, 시작 전, 카피 중, 연습 중, 완료, 보류
- 연습곡 추가
- 곡명과 아티스트명 수정
- 곡 삭제
- 곡별 상태 변경
- 진행 상황 기록 저장
- 연습 시작일과 악기 정보 저장
- 100자 제한 연습 메모 추가 및 삭제

## 기술 스택

- HTML
- CSS
- JavaScript
- LocalStorage

외부 라이브러리, 외부 폰트, 빌드 도구, npm 패키지를 사용하지 않습니다.

## 실행 방법

아래 주소에 접속해 실행할 수 있습니다.

https://basstrack.vercel.app/

로컬에서 확인하려면 `index.html` 파일을 브라우저에서 직접 열어 실행할 수 있습니다.

## 파일 구조

```text
basstrack/
├── index.html    # 화면 구조
├── style.css     # 화면 스타일
├── script.js     # 화면 렌더링, 이벤트 처리, 데이터 저장
└── README.md     # 프로젝트 설명
```

## 데이터 저장 방식

데이터는 브라우저의 LocalStorage에 JSON 문자열로 저장됩니다.

- 저장 키: `basstrack_songs_data_v1`
- 서버나 데이터베이스를 사용하지 않음
- 브라우저 사이트 데이터 또는 LocalStorage를 삭제하면 저장된 연습곡도 삭제됨

저장되는 곡 데이터는 다음 형태를 기준으로 합니다.

```js
{
  id: "track-1",
  title: "Hysteria",
  artist: "Muse",
  startDate: "2023-10-20",
  instrument: "베이스",
  status: "연습 중",
  progressText: "인트로 16분 음표 리듬 필인 부분 집중 연습 중.",
  memos: [
    {
      id: "memo-1",
      createdAt: "2026.06.20 14:30",
      content: "메모 내용"
    }
  ]
}
```

기존 저장 데이터에 `startDate` 또는 `instrument`가 없으면 앱 실행 시 기본값을 보완해 사용합니다.

