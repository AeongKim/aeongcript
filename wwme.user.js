// ==UserScript==
// @name         덥덥미 광고 차단
// @namespace    http://tampermonkey.net/
// @version      1.0
// @match        https://wwme.kr/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    // 특수문자 포함 클래스 선택자 처리
    var targets = document.querySelectorAll('.xs\\:hidden.block');
    targets.forEach(function (el) {
        el.remove();
    });
    // 동적 추가 요소 대응
    const observer = new MutationObserver(() => {
        document.querySelectorAll('.xs\\:hidden.block').forEach(el => el.remove());
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
