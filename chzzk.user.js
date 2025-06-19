// ==UserScript==
// @name         Chzzk 자동 넓은 화면 + 채팅 자동 닫기
// @namespace    http://tampermonkey.net/
// @version      1.8.2
// @description  치지직 라이브 방송 자동 넓은 화면 및 채팅창 자동 닫기
// @match        https://chzzk.naver.com/*
// @match        https://mul.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chzzk.naver.com
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
    'use strict';

    let autoWideEnabled = true;

    function isLivePage() {
        return /^\/live\/[a-zA-Z0-9]+/.test(window.location.pathname);
    }

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

    function toggleAutoWide() {
        autoWideEnabled = !autoWideEnabled;
        showStatusUI('자동 넓은 화면: ' + (autoWideEnabled ? 'ON' : 'OFF'));
        if (autoWideEnabled && isLivePage()) setAllWideScreens();
    }

    GM_registerMenuCommand("자동 넓은 화면 켜기/끄기", toggleAutoWide);

    // Alt + 3 단축키 등록
    window.addEventListener('keydown', function (e) {
        // Alt + 3 (키코드 51)
        if (e.altKey && e.key === '3') {
            // 입력창 등에서 오작동 방지
            if (document.activeElement && (
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA' ||
                document.activeElement.isContentEditable
            )) return;
            toggleAutoWide();
        }
    });

    // 채팅창 자동 닫기 함수
    function closeChatPanel() {
        const closeBtn = document.querySelector('button.live_chatting_header_button__t2pa1[aria-label="채팅 접기"]');
        if (closeBtn) closeBtn.click();
    }

    function setAllWideScreens() {
        if (!autoWideEnabled || !isLivePage()) return;
        const wideBtns = document.querySelectorAll('button[aria-label="넓은 화면"], button[aria-label="와이드 화면"]');
        wideBtns.forEach(btn => {
            if (!btn.classList.contains('selected')) {
                btn.click();
            }
        });
        closeChatPanel();
    }

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

    let lastPath = window.location.pathname;
    setInterval(() => {
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            if (isLivePage()) {
                observeWideScreenButtons();
                showStatusUI('자동 넓은 화면: ' + (autoWideEnabled ? 'ON' : 'OFF'));
            } else if (window.__chzzkWideObserver) {
                window.__chzzkWideObserver.disconnect();
            }
        }
    }, 500);

    if (isLivePage()) {
        observeWideScreenButtons();
        showStatusUI('자동 넓은 화면: ON');
    }
})();
