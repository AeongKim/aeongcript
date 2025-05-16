// ==UserScript==
// @name         [팝니다/예약중] 카테고리 게시글 차단
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  게시글 카테고리가 "판매", "판매(안전)", "예약중"인 경우 자동으로 숨깁니다.
// @match        https://m.cafe.naver.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 필터링할 상태 목록
    const BLOCKED_STATUS = ['판매', '판매(안전)', '예약중'];

    function hideSellCategoryPosts() {
        document.querySelectorAll('li.ListItem').forEach(function(item) {
            const statusSpan = item.querySelector('span.SaleStatusLabel .icon_txt');
            if (statusSpan) {
                const text = statusSpan.textContent.trim();
                if (BLOCKED_STATUS.includes(text)) {
                    item.style.display = 'none';
                }
            }
        });
    }

    // 게시글 목록 컨테이너가 로드될 때까지 기다린 후 필터링
    function waitAndFilter() {
        const targetNode = document.querySelector('ul.List.CommentArticleList');
        if (targetNode) {
            hideSellCategoryPosts();
            // 동적 게시글 추가 대응
            const observer = new MutationObserver(hideSellCategoryPosts);
            observer.observe(targetNode, { childList: true, subtree: true });
        } else {
            setTimeout(waitAndFilter, 200);
        }
    }

    // DOMContentLoaded 이후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitAndFilter);
    } else {
        waitAndFilter();
    }
})();