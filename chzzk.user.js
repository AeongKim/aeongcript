// ==UserScript==
// @name         Chzzk 자동 넓은 화면
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  치지직 방송 페이지 및 mul.live 멀티뷰에서 모든 방송에 자동으로 넓은 화면(와이드) 모드로 전환합니다. (효율성 개선)
// @match        https://chzzk.naver.com/*
// @match        https://mul.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chzzk.naver.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 버튼을 찾아서 넓은 화면 적용
    function setAllWideScreens() {
        const wideBtns = document.querySelectorAll('button[aria-label="넓은 화면"], button[aria-label="와이드 화면"]');
        wideBtns.forEach(btn => {
            if (!btn.classList.contains('selected')) {
                btn.click();
            }
        });
    }

    // MutationObserver로 방송 플레이어 추가 감지
    function observeWideScreenButtons() {
        // 이미 등록된 옵저버가 있다면 중복 방지
        if (window.__chzzkWideObserver) {
            window.__chzzkWideObserver.disconnect();
        }

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.addedNodes.length > 0) {
                    setAllWideScreens();
                }
            }
        });

        // body 전체 감시 (mul.live는 여러 방송이 동적으로 추가됨)
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 최초 1회 실행
        setAllWideScreens();

        // 전역에 저장해서 중복 방지 및 해제 가능
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

})();
