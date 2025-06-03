// ==UserScript==
// @name         Chzzk 자동 넓은 화면
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  치지직 방송 페이지에서 자동으로 넓은 화면(와이드) 모드로 전환합니다.
// @match        https://chzzk.naver.com/*
// @match        https://mul.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chzzk.naver.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 넓은 화면 버튼을 자동 클릭하는 함수
    function setWideScreen() {
        const wideBtn = document.querySelector('button[aria-label="넓은 화면"], button[aria-label="와이드 화면"]');
        if (wideBtn && !wideBtn.classList.contains('selected')) {
            wideBtn.click();
        }
    }

    // 라이브 방송 페이지에서만 실행
    function tryWideScreenOnLive() {
        if (window.location.pathname.startsWith('/live/')) {
            const interval = setInterval(() => {
                setWideScreen();
                const wideBtn = document.querySelector('button[aria-label="넓은 화면"], button[aria-label="와이드 화면"]');
                if (wideBtn && wideBtn.classList.contains('selected')) {
                    clearInterval(interval);
                }
            }, 1000); // 1초마다 체크
        }
    }

    // 최초 진입 시 실행
    tryWideScreenOnLive();

    // SPA(싱글 페이지 앱) 구조 대응: URL 변경 감지
    let lastPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            tryWideScreenOnLive();
        }
    }, 500);

})();
