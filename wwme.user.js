// ==UserScript==
// @name         덥덥미 광고 차단
// @namespace    http://tampermonkey.net/
// @version      1.2
// @match        https://wwme.kr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 광고 요소를 모두 제거하는 함수
    function removeAds() {
        document.querySelectorAll(
            '.xs\\:hidden.block, .lg\\:block.hidden, .lg\\:hidden.xs\\:block.hidden'
        ).forEach(el => el.remove());
    }

    // 최초 실행
    removeAds();

    // 동적 요소 감지
    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, { childList: true, subtree: true });
})();
