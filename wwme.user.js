// ==UserScript==
// @name         덥덥미 광고 차단
// @namespace    http://tampermonkey.net/
// @version      1.1
// @match        https://wwme.kr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 1. 두 요소를 동시에 제거하는 함수 생성
    function removeAds() {
        document.querySelectorAll('.xs\\:hidden.block, .lg\\:block.hidden').forEach(el => el.remove());
    }

    // 2. 최초 실행
    removeAds();

    // 3. 동적 요소 감지 로직
    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, { childList: true, subtree: true });
})();
