// main.js

// 1. Firebase 초기화 설정
const firebaseConfig = {
  apiKey: "AIzaSyDG3i-s_3Y_1nea2BPf_tlwe4Rt_4oNdFg",
  authDomain: "phoming.firebaseapp.com",
  projectId: "phoming",
  storageBucket: "phoming.firebasestorage.app",
  messagingSenderId: "4650717163",
  appId: "1:4650717163:web:cc2e21a66194641ebe13ae",
  measurementId: "G-VZZ593T9ZV",
  databaseURL: "https://phoming-default-rtdb.asia-southeast1.firebasedatabase.app"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();
// 🟢 messages 경로를 명확히 지정하여 실시간 연동
const messagesRef = db.ref('messages');
const profileRef = db.ref('profile');

// 2. DOM 요소 참조
const screen1 = document.getElementById('screen-1');
const screen2 = document.getElementById('screen-2');

const startChatBtn = document.getElementById('start-chat-btn');
const backBtn = document.getElementById('back-btn');
const moreBtn = document.getElementById('more-btn');

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

// 채팅 이미지 관련 DOM
const chatImageInput = document.getElementById('chat-image-input');
const sendOptionSheet = document.getElementById('send-option-sheet');
const btnSendText = document.getElementById('btn-send-text');
const btnSendImage = document.getElementById('btn-send-image');
const closeSendOptionBtn = document.getElementById('close-send-option-btn');

// 프로필/상태 메시지 DOM
const mainProfileImg = document.getElementById('main-profile-img');
const headerProfileImg = document.getElementById('header-profile-img');
const mainStatusMsg = document.getElementById('main-status-msg');
const mainArtistName = document.getElementById('main-artist-name');
const headerArtistName = document.getElementById('header-artist-name');

// 바텀시트 메뉴 DOM
const menuSheet = document.getElementById('menu-sheet');
const closeSheetBtn = document.getElementById('close-sheet-btn');

const btnChangeArtistName = document.getElementById('btn-change-artist-name');
const btnChangeProfileImg = document.getElementById('btn-change-profile-img');
const fileInputProfile = document.getElementById('file-input-profile');
const btnToggleArtist = document.getElementById('btn-toggle-artist');
const btnDeleteGuide = document.getElementById('btn-delete-guide');
const btnChangeStatusMsg = document.getElementById('btn-change-status-msg');

// 기본 상태값
let isArtistMode = false;
let isAdmin = false; 
const ADMIN_PASSWORD = "12301995";

let profileImgUrl = 'profile.png';
let statusMsgText = '감기 조심하세요...🤧';
let artistNameText = '•૦•💗💗💗';

// 🟢 화면 프로필 업데이트
function applyStoredData() {
    mainProfileImg.src = profileImgUrl;
    headerProfileImg.src = profileImgUrl;
    mainStatusMsg.innerText = statusMsgText;
    mainArtistName.innerText = artistNameText;
    headerArtistName.innerText = artistNameText;
}

// 🟢 Firebase DB 프로필 저장
function updateProfileToFirebase(updatedFields) {
    profileRef.update(updatedFields);
}

// 🟢 Firebase 프로필 실시간 감지
profileRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.artistName) artistNameText = data.artistName;
        if (data.statusMsg) statusMsgText = data.statusMsg;
        if (data.profileImgUrl) profileImgUrl = data.profileImgUrl;
        applyStoredData();
    }
});

// 화면 전환
startChatBtn.addEventListener('click', () => {
    screen1.classList.remove('active');
    screen2.classList.add('active');
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

backBtn.addEventListener('click', () => {
    screen2.classList.remove('active');
    screen1.classList.add('active');
});

// 관리자 더보기 버튼
moreBtn.addEventListener('click', () => {
    if (isAdmin) {
        updateArtistModeButtonText();
        menuSheet.classList.remove('hidden');
        return;
    }
    const password = prompt("암호는?");
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        updateArtistModeButtonText();
        menuSheet.classList.remove('hidden');
    } else if (password !== null) {
        alert("제 영역입니닷!");
    }
});

// 상태 메시지 설정
btnChangeStatusMsg.addEventListener('click', () => {
    const newStatus = prompt("새로운 상태 메시지를 입력하세요:", statusMsgText);
    if (newStatus !== null) {
        statusMsgText = newStatus.trim();
        updateProfileToFirebase({ statusMsg: statusMsgText });
        alert("상태 메시지가 변경되었습니다.");
    }
});

closeSheetBtn.addEventListener('click', () => {
    menuSheet.classList.add('hidden');
});

// 아티스트 이름 설정
btnChangeArtistName.addEventListener('click', () => {
    const newName = prompt("새로운 이름을 입력하세요:", artistNameText);
    if (newName && newName.trim() !== '') {
        artistNameText = newName.trim();
        updateProfileToFirebase({ artistName: artistNameText });
        alert("짠!");
    }
});

// 프로필 이미지 변경
btnChangeProfileImg.addEventListener('click', () => {
    menuSheet.classList.add('hidden');
    fileInputProfile.click();
});

fileInputProfile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        compressImage(file, 400, 0.7, (compressedDataUrl) => {
            profileImgUrl = compressedDataUrl;
            updateProfileToFirebase({ profileImgUrl: profileImgUrl });
            alert("프로필 사진이 변경되었습니다.");
        });
    }
});

// 답장 모드 토글
btnToggleArtist.addEventListener('click', () => {
    isArtistMode = !isArtistMode;
    if (isArtistMode) {
        alert("답장 모드로 전환되었습니다.");
        messageInput.placeholder = "답장을 입력해 주세요.";
        screen2.classList.add('artist-mode-bg');
    } else {
        alert("일반 모드로 전환되었습니다.");
        messageInput.placeholder = "메시지를 입력해 주세요.";
        screen2.classList.remove('artist-mode-bg');
    }
    updateArtistModeButtonText();
    menuSheet.classList.add('hidden');
});

function updateArtistModeButtonText() {
    btnToggleArtist.innerText = isArtistMode 
        ? "답장/삭제(현재: ON)" 
        : "답장/삭제(현재: OFF)";
}

// 메시지 삭제 방법 안내
btnDeleteGuide.addEventListener('click', () => {
    alert("채팅창에 등록된 메시지를 터치/클릭하면 삭제 여부를 묻는 창이 뜨며 바로 삭제할 수 있습니다.");
    menuSheet.classList.add('hidden');
});

// 전송 폼 이벤트
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isAdmin) {
        sendOptionSheet.classList.remove('hidden');
    } else {
        executeTextSend();
    }
});

btnSendText.addEventListener('click', () => {
    sendOptionSheet.classList.add('hidden');
    executeTextSend();
});

btnSendImage.addEventListener('click', () => {
    sendOptionSheet.classList.add('hidden');
    if (!isAdmin) {
        alert("이미지 전송은 관리자만 가능합니다.");
        return;
    }
    chatImageInput.click();
});

closeSendOptionBtn.addEventListener('click', () => {
    sendOptionSheet.classList.add('hidden');
});

// 이미지 압축 헬퍼
function compressImage(file, maxWidth, quality, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 이미지 전송
chatImageInput.addEventListener('change', (e) => {
    if (!isAdmin) {
        alert("이미지는 관리자만 전송할 수 있습니다.");
        chatImageInput.value = '';
        return;
    }

    const file = e.target.files[0];
    if (file) {
        compressImage(file, 600, 0.7, (compressedDataUrl) => {
            const senderType = isArtistMode ? 'artist' : 'user';

            messagesRef.push({
                messageType: 'image',
                text: compressedDataUrl,
                senderType: senderType,
                createdAt: Date.now()
            });

            chatImageInput.value = '';
        });
    }
});

// 🟢 텍스트 메시지 전송 (Firebase DB push)
function executeTextSend() {
    const text = messageInput.value.trim();
    if (!text) return;

    const senderType = isArtistMode ? 'artist' : 'user';

    messagesRef.push({
        messageType: 'text',
        text: text,
        senderType: senderType,
        createdAt: Date.now()
    });

    messageInput.value = '';
}

// 🟢 메시지 HTML 생성 및 렌더링
function renderMessage(msgId, data) {
    if (!data) return;

    // 중복 생성 방지
    const existingMsg = document.querySelector(`[data-id="${msgId}"]`);
    if (existingMsg) return;

    let text = data.text || '';
    let senderType = data.senderType || 'user';
    let messageType = data.messageType || 'text';

    if (typeof text === 'string' && text.startsWith('data:image/')) {
        messageType = 'image';
    }

    const groupDiv = document.createElement('div');
    groupDiv.setAttribute('data-id', msgId);

    let contentHtml = '';
    
    if (messageType === 'image') {
        const imgClass = senderType === 'artist' ? 'other-img-msg' : 'my-img-msg';
        contentHtml = `
            <div class="msg-img-container ${imgClass} delete-target">
                <img src="${text}" class="msg-img" alt="shared photo">
            </div>
        `;
    } else {
        const bubbleClass = senderType === 'artist' ? 'other-msg' : 'my-msg';
        contentHtml = `<div class="message ${bubbleClass} delete-target">${escapeHtml(text)}</div>`;
    }

    const timeStr = data.createdAt ? formatTime(data.createdAt) : getCurrentTime();

    if (senderType === 'artist') {
        groupDiv.classList.add('message-group', 'other');
        groupDiv.innerHTML = `
            <img src="${profileImgUrl}" class="msg-thumb" onerror="this.src='profile.png'">
            <div class="msg-content">
                <span class="msg-sender">${artistNameText}</span>
                <div class="other-msg-container">
                    ${contentHtml}
                    <span class="msg-time">${timeStr}</span>
                </div>
            </div>
        `;
    } else {
        groupDiv.classList.add('message-group', 'my');
        groupDiv.innerHTML = `
            <div class="msg-content">
                <div class="msg-my-wrapper">
                    <span class="msg-time">${timeStr}</span>
                    ${contentHtml}
                </div>
            </div>
        `;
    }

    // 영구 삭제 이벤트 연동
    const clickableArea = groupDiv.querySelector('.delete-target');
    if (clickableArea) {
        clickableArea.addEventListener('click', () => {
            if (!isAdmin) return;

            if (confirm("해당 항목을 영구 삭제하시겠습니까?")) {
                messagesRef.child(msgId).remove();
            }
        });
    }

    chatMessages.appendChild(groupDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 🟢 Firebase 데이터 실시간 수신 및 초기 로드
messagesRef.on('child_added', (snapshot) => {
    renderMessage(snapshot.key, snapshot.val());
});

// 🟢 Firebase 삭제 감지
messagesRef.on('child_removed', (snapshot) => {
    const targetEl = document.querySelector(`[data-id="${snapshot.key}"]`);
    if (targetEl) {
        targetEl.remove();
    }
});

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getCurrentTime() {
    return formatTime(Date.now());
}

// 🟢 특수문자 탈출 및 줄바꿈(\n -> <br>) 처리
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
}