// ==UserScript==
// @name         Chzzk 자동 넓은 화면
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  치지직 방송 페이지에서 자동으로 넓은 화면(와이드) 모드로 전환합니다.
// @match        https://chzzk.naver.com/*
// @match        https://mul.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chzzk.naver.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let wideScreenInterval = null;

    function setWideScreen() {
        const wideBtn = document.querySelector('button[aria-label="넓은 화면"], button[aria-label="와이드 화면"]');
        if (wideBtn && !wideBtn.classList.contains('selected')) {
            wideBtn.click();
            return true;
        }
        return false;
    }

    function tryWideScreenOnLive() {
        // 기존 interval이 있으면 정리
        if (wideScreenInterval) {
            clearInterval(wideScreenInterval);
            wideScreenInterval = null;
        }
        if (window.location.pathname.startsWith('/live/')) {
            wideScreenInterval = setInterval(() => {
                if (setWideScreen()) {
                    // 버튼 클릭 성공 시 interval 정리
                    clearInterval(wideScreenInterval);
                    wideScreenInterval = null;
                }
            }, 1000);
        }
    }

    // 최초 진입 시 실행
    tryWideScreenOnLive();

    // SPA 구조 대응: URL 변경 감지
    let lastPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            tryWideScreenOnLive();
        }
    }, 500);

})();
