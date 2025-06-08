// ==UserScript==
// @name         Chzzk 자동 넓은 화면
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  치지직 방송 페이지 및 mul.live 멀티뷰에서 자동 넓은 화면
// @match        https://chzzk.naver.com/*
// @match        https://mul.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chzzk.naver.com
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    let autoWideEnabled = true; // 기본값 ON

    // 상태 UI 표시 함수
    function showStatusUI(text) {
        let statusDiv = document.getElementById('chzzkWideStatusUI');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'chzzkWideStatusUI';
            Object.assign(statusDiv.style, {
                position: 'fixed',
                top: '30px',
                right: '30px',
                zIndex: '99999',
                background: 'rgba(30,30,30,0.95)',
                color: '#fff',
                padding: '14px 24px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transition: 'opacity 0.2s',
                opacity: '1',
                pointerEvents: 'none'
            });
            document.body.appendChild(statusDiv);
        }
        statusDiv.innerText = text;
        statusDiv.style.opacity = '1';
        statusDiv.style.display = 'block';
        clearTimeout(statusDiv._hideTimer);
        statusDiv._hideTimer = setTimeout(() => {
            statusDiv.style.opacity = '0';
            setTimeout(() => { statusDiv.style.display = 'none'; }, 200);
        }, 1000);
    }

    // 메뉴 1개만 등록 (상태 표시는 UI로만)
    GM_registerMenuCommand("자동 넓은 화면 켜기/끄기", function () {
        autoWideEnabled = !autoWideEnabled;
        showStatusUI('자동 넓은 화면: ' + (autoWideEnabled ? 'ON' : 'OFF'));
        if (autoWideEnabled) setAllWideScreens();
    });

    // 넓은 화면 적용 함수
    function setAllWideScreens() {
        if (!autoWideEnabled) return;
        const wideBtns = document.querySelectorAll('button[aria-label="넓은 화면"], button[aria-label="와이드 화면"]');
        wideBtns.forEach(btn => {
            if (!btn.classList.contains('selected')) {
                btn.click();
            }
        });
    }

    // MutationObserver로 동적 감지
    function observeWideScreenButtons() {
        if (window.__chzzkWideObserver) window.__chzzkWideObserver.disconnect();

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.addedNodes.length > 0) setAllWideScreens();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setAllWideScreens();
        window.__chzzkWideObserver = observer;
    }

    // SPA 구조 대응: URL 변경 감지
    let lastPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            observeWideScreenButtons();
        }
    }, 500);

    // 최초 진입 시 실행
    observeWideScreenButtons();

    // 최초 상태 UI 1초 표시
    showStatusUI('자동 넓은 화면: ON');
})();
