// Key for local storage persistence
const STORAGE_KEY = "basstrack_songs_data_v1";

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// YYYY-MM-DD → YYYY.MM.DD 표시용 변환
function formatDateForDisplay(dateStr) {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '.');
}

// Default tracks to load if nothing exists in storage
const DEFAULT_TRACKS = [
  {
    id: "track-1",
    title: "Hysteria",
    artist: "Muse",
    startDate: "2023-10-20",
    instrument: "베이스",
    status: "연습 중",
    progressText: "인트로 16분 음표 리듬 필인 부분 집중 연습 중. 템포 110부터 맞춰가는 단계.",
    memos: [
      {
        id: "memo-1-1",
        createdAt: "2023.10.24 14:30",
        content: "인트로 퍼즈 베이스 톤 잡는 중. 드라이브가 좀 더 끈적해야 할 듯. 16분 음표 고스트 노트를 더 정확하게 연주하기."
      },
      {
        id: "memo-1-2",
        createdAt: "2023.10.22 19:15",
        content: "벌스 파트 운지 확인 완료. 후렴구로 넘어가는 슬라이드가 어색함."
      }
    ]
  },
  {
    id: "track-2",
    title: "Sir Duke",
    artist: "Stevie Wonder",
    startDate: "2026-06-01",
    instrument: "베이스",
    status: "카피 중",
    progressText: "중간 브릿지 혼 섹션 유니즌 부분 운지 거의 다 외움.",
    memos: [
      {
        id: "memo-2-1",
        createdAt: "2026.06.12 10:00",
        content: "브릿지 파트 기계적인 크로매틱 라인이라 스케일 연습이 절실히 필요한 상태."
      }
    ]
  },
  {
    id: "track-3",
    title: "Dean Town",
    artist: "Vulfpeck",
    startDate: "2026-05-15",
    instrument: "베이스",
    status: "완료",
    progressText: "곡 전체를 막힘 없이 완벽하게 연주 가능. 톤 메이킹도 끝났음.",
    memos: [
      {
        id: "memo-3-1",
        createdAt: "2026.06.10 15:30",
        content: "오른손 핑거링 더블링 터치를 완벽하게 제어할 수 있을 때까지 계속 다듬은 결과, 마침내 원곡 속도로 안정적인 합주 성공!"
      }
    ]
  },
  {
    id: "track-4",
    title: "Uptown Funk",
    artist: "Bruno Mars",
    startDate: "2026-06-20",
    instrument: "베이스",
    status: "시작 전",
    progressText: "",
    memos: []
  },
  {
    id: "track-5",
    title: "Teen Town",
    artist: "Weather Report",
    startDate: "2026-05-01",
    instrument: "베이스",
    status: "보류",
    progressText: "곡의 리듬과 멜로디 전개가 너무 난해해서 조금 나중에 기초 체력을 더 기르고 재도전할 예정.",
    memos: [
      {
        id: "memo-5-1",
        createdAt: "2026.05.20 22:00",
        content: "16분 음표 싱코페이션 바운스가 상상을 초월할 정도로 빠르고 불규칙하다."
      }
    ]
  }
];

// App State
let tracks = [];
let searchQuery = "";
let statusFilter = "전체";
let selectedTrackId = null;
let activeDetailStatus = "시작 전";

// 수정 모드 상태
let isEditingHeading = false;

// Load from local storage
function loadTracks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      tracks = JSON.parse(saved);
      // 기존 데이터에 신규 필드 기본값 처리
      tracks = tracks.map(track => ({
        startDate: getTodayDateString(),
        instrument: "베이스",
        ...track
      }));
    } catch (e) {
      console.error("Local storage loaded error, restoring defaults", e);
      tracks = JSON.parse(JSON.stringify(DEFAULT_TRACKS));
    }
  } else {
    tracks = JSON.parse(JSON.stringify(DEFAULT_TRACKS));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  }
}

// Save to local storage
function saveTracks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

// Generate formatted time stamp: "YYYY.MM.DD HH:MM"
function getFormattedTimestamp() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${min}`;
}

function getStatusColorClasses(status) {
  switch (status) {
    case "완료": return "status-completed";
    case "연습 중": return "status-practicing";
    case "카피 중": return "status-copying";
    case "보류": return "status-paused";
    case "시작 전":
    default: return "status-not-started";
  }
}

function getInstrumentEmoji(instrument) {
  switch (instrument) {
    case "기타": return "🎸";
    case "드럼": return "🥁";
    case "키보드": return "🎹";
    case "기타 악기": return "🎵";
    case "베이스":
    default: return "🎸";
  }
}

// Toast Popup Controller
function showToast(message) {
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toast-text");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("is-visible");

  setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2500);
}

// 상태 필터 UI 업데이트
function updateFilterUI() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.classList.toggle("is-active", btn.getAttribute("data-filter") === statusFilter);
  });
}

// Render Main Screen List
function renderMainScreen() {
  const activeCountEl = document.getElementById("active-count");
  if (activeCountEl) {
    const activeProjects = tracks.filter(t => t.status !== "완료").length;
    activeCountEl.textContent = `${activeProjects}개의 프로젝트 진행 중`;
  }

  const listContainer = document.getElementById("track-list-container");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  const query = searchQuery.trim().toLowerCase();
  const filtered = tracks.filter(track => {
    // 검색어 필터
    const matchesQuery = !query ||
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query);
    // 상태 필터
    const matchesStatus = statusFilter === "전체" || track.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-list">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.1 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4"></path>
          <path d="M12 18h.01"></path>
        </svg>
        <p class="empty-list-title">검색 결과가 없습니다.</p>
        <p class="empty-list-copy">새로운 도전을 목록에 추가해 보세요!</p>
      </div>
    `;
    return;
  }

  filtered.forEach(track => {
    const item = document.createElement("div");
    item.className = "track-item";
    item.addEventListener("click", () => openTrackDetail(track.id));

    // Progress preview logic
    let progressPreviewHtml = "";
    if (track.progressText && track.progressText.trim()) {
      progressPreviewHtml = `
        <div class="progress-preview">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2 6h6a4 4 0 0 1 4 4v10a3 3 0 0 0-3-3H2Z"></path>
            <path d="M22 6h-6a4 4 0 0 0-4 4v10a3 3 0 0 1 3-3h7Z"></path>
          </svg>
          <span>${escapeHTML(track.progressText)}</span>
        </div>
      `;
    }

    // 시작일 & 악기 메타 정보
    const instrument = track.instrument || "베이스";
    const startDate = track.startDate ? formatDateForDisplay(track.startDate) : '';
    const metaHtml = `
      <div class="track-meta">
        <span class="track-instrument-tag">${escapeHTML(instrument)}</span>
        ${startDate ? `<span class="track-start-date">📅 ${escapeHTML(startDate)}</span>` : ''}
      </div>
    `;

    item.innerHTML = `
      <div class="track-main">
        <h3 class="track-title">${escapeHTML(track.title)}</h3>
        <p class="track-artist">${escapeHTML(track.artist)}</p>
        ${metaHtml}
        ${progressPreviewHtml}
      </div>
      <div class="track-status-wrap">
        <span class="track-status ${getStatusColorClasses(track.status)}">${escapeHTML(track.status)}</span>
      </div>
    `;
    listContainer.appendChild(item);
  });
}

// 수정 모드 진입
function enterHeadingEditMode() {
  const track = tracks.find(t => t.id === selectedTrackId);
  if (!track) return;

  // input에 현재 값 세팅
  document.getElementById("detail-title").value = track.title;
  document.getElementById("detail-artist").value = track.artist;

  // 뷰 전환
  document.getElementById("detail-heading-view").classList.add("hidden");
  document.getElementById("detail-heading-edit").classList.remove("hidden");
  document.getElementById("detail-title").focus();
  isEditingHeading = true;
}

// 수정 모드 저장
function saveHeadingEdit() {
  if (!selectedTrackId) return;
  const trackIndex = tracks.findIndex(t => t.id === selectedTrackId);
  if (trackIndex === -1) return;

  const titleVal = document.getElementById("detail-title").value.trim();
  const artistVal = document.getElementById("detail-artist").value.trim();

  if (!titleVal) {
    showToast("곡명을 입력해주세요.");
    document.getElementById("detail-title").focus();
    return;
  }

  tracks[trackIndex].title = titleVal;
  tracks[trackIndex].artist = artistVal || "Unknown Artist";
  saveTracks();

  // 텍스트 요소 업데이트
  document.getElementById("detail-title-text").textContent = tracks[trackIndex].title;
  document.getElementById("detail-artist-text").textContent = tracks[trackIndex].artist;

  // 뷰 전환
  document.getElementById("detail-heading-edit").classList.add("hidden");
  document.getElementById("detail-heading-view").classList.remove("hidden");
  isEditingHeading = false;

  showToast("곡명/아티스트가 수정되었습니다.");
}

// 수정 모드 취소
function cancelHeadingEdit() {
  const track = tracks.find(t => t.id === selectedTrackId);
  if (track) {
    document.getElementById("detail-title").value = track.title;
    document.getElementById("detail-artist").value = track.artist;
  }

  document.getElementById("detail-heading-edit").classList.add("hidden");
  document.getElementById("detail-heading-view").classList.remove("hidden");
  isEditingHeading = false;
}

// Navigation to Details Screen
function openTrackDetail(id) {
  selectedTrackId = id;
  const track = tracks.find(t => t.id === id);
  if (!track) return;

  activeDetailStatus = track.status;

  // Toggle visible views with smooth sliding class transformations
  document.getElementById("main-screen").classList.add("hidden");
  document.getElementById("detail-screen").classList.remove("hidden");

  // 텍스트 표시 모드로 초기화
  document.getElementById("detail-title-text").textContent = track.title;
  document.getElementById("detail-artist-text").textContent = track.artist;
  document.getElementById("detail-heading-view").classList.remove("hidden");
  document.getElementById("detail-heading-edit").classList.add("hidden");
  isEditingHeading = false;

  // input 값도 동기화 (saveTrackDetail에서 사용)
  document.getElementById("detail-title").value = track.title;
  document.getElementById("detail-artist").value = track.artist;
  document.getElementById("detail-progress").value = track.progressText || "";
  document.getElementById("detail-memo").value = "";

  // 연습 시작일 & 악기 세팅
  document.getElementById("detail-start-date").value = track.startDate || getTodayDateString();
  const instrumentSelect = document.getElementById("detail-instrument");
  const instrumentVal = track.instrument || "베이스";
  // select option 중 일치하는 값 선택
  for (let i = 0; i < instrumentSelect.options.length; i++) {
    if (instrumentSelect.options[i].value === instrumentVal) {
      instrumentSelect.selectedIndex = i;
      break;
    }
  }

  // Render sub sections inside detail
  updateDetailStatusRadioUI();
  renderMemoHistory();
}

// Render Status change radio highlights
function updateDetailStatusRadioUI() {
  const statusButtons = document.querySelectorAll(".status-btn");
  statusButtons.forEach(btn => {
    const statusVal = btn.getAttribute("data-status");
    btn.classList.toggle("is-active", statusVal === activeDetailStatus);
  });
}

// Return back to list view
function closeTrackDetail() {
  selectedTrackId = null;
  document.getElementById("detail-screen").classList.add("hidden");
  document.getElementById("main-screen").classList.remove("hidden");
  renderMainScreen();
}

// Render Memo Comments Timeline
function renderMemoHistory() {
  const memoContainer = document.getElementById("memo-history-container");
  const memoCountEl = document.getElementById("memo-count");
  if (!memoContainer || !selectedTrackId) return;

  const track = tracks.find(t => t.id === selectedTrackId);
  if (!track) return;

  memoCountEl.textContent = `총 ${track.memos.length}개`;
  memoContainer.innerHTML = "";

  if (track.memos.length === 0) {
    memoContainer.innerHTML = `
      <div class="memo-empty">
        <p class="memo-empty-title">저장된 연습 메모가 아직 없습니다.</p>
        <p class="memo-empty-copy">위 입력란에 메모를 적고 메모 추가 버튼을 눌러보세요!</p>
      </div>
    `;
    return;
  }

  track.memos.forEach(memo => {
    const card = document.createElement("div");
    card.className = "memo-card";
    card.innerHTML = `
      <div class="memo-card-header">
        <div class="memo-time">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 7v5l3 2"></path>
          </svg>
          <span>${escapeHTML(memo.createdAt)}</span>
        </div>
        <button onclick="deleteMemo('${memo.id}')" class="memo-delete" type="button" aria-label="메모 삭제">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18"></path>
            <path d="M8 6V4h8v2"></path>
            <path d="m19 6-1 14H6L5 6"></path>
            <path d="M10 11v5"></path>
            <path d="M14 11v5"></path>
          </svg>
        </button>
      </div>
      <p class="memo-content">${escapeHTML(memo.content)}</p>
    `;
    memoContainer.appendChild(card);
  });
}

// Handle Single Memo delete event
window.deleteMemo = function(memoId) {
  if (!selectedTrackId) return;
  const track = tracks.find(t => t.id === selectedTrackId);
  if (!track) return;

  track.memos = track.memos.filter(m => m.id !== memoId);
  saveTracks();
  renderMemoHistory();
  showToast("메모가 삭제되었습니다.");
};

function addMemo() {
  if (!selectedTrackId) return;

  const track = tracks.find(t => t.id === selectedTrackId);
  const memoInput = document.getElementById("detail-memo");
  if (!track || !memoInput) return;

  const content = memoInput.value.trim();
  if (!content) {
    showToast("메모 내용을 입력해주세요.");
    return;
  }

  track.memos.unshift({
    id: `memo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: getFormattedTimestamp(),
    content
  });

  saveTracks();
  memoInput.value = "";
  renderMemoHistory();
  showToast("메모가 추가되었습니다.");
}

// Global details save action handler
function saveTrackDetail() {
  if (!selectedTrackId) return;
  const trackIndex = tracks.findIndex(t => t.id === selectedTrackId);
  if (trackIndex === -1) return;

  const track = tracks[trackIndex];
  const titleVal = document.getElementById("detail-title").value.trim();
  const artistVal = document.getElementById("detail-artist").value.trim();
  const progressTextVal = document.getElementById("detail-progress").value.trim();
  const startDateVal = document.getElementById("detail-start-date").value;
  const instrumentVal = document.getElementById("detail-instrument").value;

  if (!titleVal) {
    showToast("곡명을 입력해주세요.");
    document.getElementById("detail-title").focus();
    return;
  }

  track.title = titleVal;
  track.artist = artistVal || "Unknown Artist";
  track.status = activeDetailStatus;
  track.progressText = progressTextVal;
  track.startDate = startDateVal || getTodayDateString();
  track.instrument = instrumentVal || "베이스";

  saveTracks();
  showToast("기록이 성공적으로 저장되었습니다!");
  closeTrackDetail();
}

function deleteTrack() {
  if (!selectedTrackId) return;

  const track = tracks.find(t => t.id === selectedTrackId);
  if (!track) return;

  const confirmed = window.confirm(`"${track.title}" 곡을 삭제하시겠습니까?`);
  if (!confirmed) return;

  tracks = tracks.filter(t => t.id !== selectedTrackId);
  saveTracks();
  closeTrackDetail();
  showToast("곡이 삭제되었습니다.");
}

// Open modal representation
function openAddTrackModal() {
  document.getElementById("add-modal-title").value = "";
  document.getElementById("add-modal-artist").value = "";
  document.getElementById("add-modal-instrument").selectedIndex = 0;
  document.getElementById("add-modal-start-date").value = getTodayDateString();
  document.getElementById("modal-error-msg").classList.add("hidden");
  document.getElementById("add-track-modal").classList.remove("hidden");
}

// Close Modal windows helper
function closeAddTrackModal() {
  document.getElementById("add-track-modal").classList.add("hidden");
}

// Submit and persistence logic for adding tracks
function submitNewTrack() {
  const titleInput = document.getElementById("add-modal-title").value.trim();
  const artistInput = document.getElementById("add-modal-artist").value.trim();
  const instrumentInput = document.getElementById("add-modal-instrument").value;
  const startDateInput = document.getElementById("add-modal-start-date").value;
  const errorEl = document.getElementById("modal-error-msg");

  if (!titleInput) {
    errorEl.textContent = "곡명은 필수 입력 항목입니다.";
    errorEl.classList.remove("hidden");
    return;
  }

  const newTrack = {
    id: `track-${Date.now()}`,
    title: titleInput,
    artist: artistInput || "Unknown Artist",
    startDate: startDateInput || getTodayDateString(),
    instrument: instrumentInput || "베이스",
    status: "시작 전",
    progressText: "",
    memos: []
  };

  tracks.push(newTrack);
  saveTracks();
  closeAddTrackModal();
  renderMainScreen();
  showToast("새로운 도전 곡이 추가되었습니다!");
}

// Simple security helper to replace HTML characters preventing XSS
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// App Initialization Event Binding
document.addEventListener("DOMContentLoaded", () => {
  // Load storage index data
  loadTracks();

  // Initial draw
  renderMainScreen();

  // Binding search inputs
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderMainScreen();
    });
  }

  // Clear query cross icon
  const clearSearchBtn = document.getElementById("clear-search-btn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchQuery = "";
        renderMainScreen();
      }
    });
  }

  // 상태 필터 버튼 이벤트
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      statusFilter = btn.getAttribute("data-filter");
      updateFilterUI();
      renderMainScreen();
    });
  });

  // Binding status radio buttons click event (상세 페이지)
  const statusButtons = document.querySelectorAll(".status-btn");
  statusButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeDetailStatus = btn.getAttribute("data-status");
      updateDetailStatusRadioUI();
    });
  });

  // Click handler wrapper on dashed boxes representation
  const mainAddChallengeBtn = document.getElementById("main-add-challenge-btn");
  if (mainAddChallengeBtn) {
    mainAddChallengeBtn.addEventListener("click", () => {
      openAddTrackModal();
    });
  }

  // Close modals clicking backgrounds or back close button
  const modalCloseBtn = document.getElementById("modal-close-btn");
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeAddTrackModal);
  }

  const modalBackdrop = document.getElementById("modal-backdrop");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeAddTrackModal);
  }

  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener("click", closeAddTrackModal);
  }

  const modalSubmitBtn = document.getElementById("modal-submit-btn");
  if (modalSubmitBtn) {
    modalSubmitBtn.addEventListener("click", submitNewTrack);
  }

  // Back action logic in details view
  const detailBackBtn = document.getElementById("detail-back-btn");
  if (detailBackBtn) {
    detailBackBtn.addEventListener("click", closeTrackDetail);
  }

  // Save record action logic details
  const detailSaveBtn = document.getElementById("detail-save-btn");
  if (detailSaveBtn) {
    detailSaveBtn.addEventListener("click", saveTrackDetail);
  }

  const detailMemoAddBtn = document.getElementById("detail-memo-add-btn");
  if (detailMemoAddBtn) {
    detailMemoAddBtn.addEventListener("click", addMemo);
  }

  const detailDeleteBtn = document.getElementById("detail-delete-btn");
  if (detailDeleteBtn) {
    detailDeleteBtn.addEventListener("click", deleteTrack);
  }

  // 수정 버튼 클릭 → 수정 모드 진입
  const detailEditBtn = document.getElementById("detail-edit-btn");
  if (detailEditBtn) {
    detailEditBtn.addEventListener("click", enterHeadingEditMode);
  }

  // 수정 모드 저장 버튼
  const detailEditSaveBtn = document.getElementById("detail-edit-save-btn");
  if (detailEditSaveBtn) {
    detailEditSaveBtn.addEventListener("click", saveHeadingEdit);
  }

  // 수정 모드 취소 버튼
  const detailEditCancelBtn = document.getElementById("detail-edit-cancel-btn");
  if (detailEditCancelBtn) {
    detailEditCancelBtn.addEventListener("click", cancelHeadingEdit);
  }
});
