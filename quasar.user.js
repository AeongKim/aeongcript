// ==UserScript==
// @name         퀘이사존 특정 유저 게시글 차단기
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  퀘이사존 핫딜 게시판에서 특정 유저의 게시글을 완전히 숨깁니다.
// @match        https://quasarzone.com/bbs/qb_saleinfo*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 차단할 닉네임을 여기에 추가
    const blockedUsers = ['아리시아']; // 원하는 닉네임으로 수정

    function hideBlockedPosts() {
        // 모든 게시글 박스를 선택
        const postBoxes = document.querySelectorAll('div.market-info-list');

        postBoxes.forEach(postBox => {
            const userNickEl = postBox.querySelector('span.user-nick-wrap[data-nick]');
            if (!userNickEl) return;

            const nickname = userNickEl.getAttribute('data-nick')?.trim();
            if (blockedUsers.includes(nickname)) {
                const row = postBox.closest('tr'); // 테이블 내 게시글 행 전체 제거
                if (row) {
                    row.remove(); // 깔끔하게 삭제
                } else {
                    postBox.style.display = 'none'; // 예외 상황 처리
                }
            }
        });
    }

    // 페이지 로드 후 실행
    window.addEventListener('load', () => {
        hideBlockedPosts();

        // 게시글이 AJAX로 동적으로 변경될 가능성에 대비
        const observer = new MutationObserver(() => {
            hideBlockedPosts();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();