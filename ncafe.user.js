// ==UserScript==
// @name         네이버 카페(모바일) 판매글 차단기
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  판매 관련 게시글 필터링
// @match        https://m.cafe.naver.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 고속 검색을 위한 상수 정의
    const BLOCKED_STATUS = new Set(['판매', '판매(안전)', '예약중', '예약중(안전)']);
    const FILTERED_CLASS = 'sell-filtered-item';
    let isProcessing = false;
    let lastScrollY = 0;
    let frameRequestId = null;

    // CSS 규칙 추가 - DOM 조작 대신 클래스로 숨김 처리
    const styleEl = document.createElement('style');
    styleEl.textContent = `.${FILTERED_CLASS} { display: none !important; }`;
    document.head.appendChild(styleEl);

    // 최적화된 필터링 함수 (배치 처리)
    function hideSellPosts() {
        if (isProcessing) return;
        isProcessing = true;

        // 처리할 항목 선택을 한번에 수행
        const itemsToProcess = document.querySelectorAll('li.ListItem:not([data-filtered])');
        if (itemsToProcess.length === 0) {
            isProcessing = false;
            return;
        }

        // 성능 저하 방지를 위해 일정 개수씩 처리
        const batchSize = 20;
        let index = 0;

        function processBatch() {
            const endIndex = Math.min(index + batchSize, itemsToProcess.length);

            // 배치 처리 - 한 번에 최대 20개씩 처리
            for (let i = index; i < endIndex; i++) {
                const item = itemsToProcess[i];
                const statusSpan = item.querySelector('span.SaleStatusLabel .icon_txt');

                if (statusSpan && BLOCKED_STATUS.has(statusSpan.textContent.trim())) {
                    item.classList.add(FILTERED_CLASS);
                }
                item.setAttribute('data-filtered', 'true');
            }

            index = endIndex;

            // 아직 처리할 항목이 남아있으면 다음 애니메이션 프레임에서 계속 처리
            if (index < itemsToProcess.length) {
                frameRequestId = requestAnimationFrame(processBatch);
            } else {
                frameRequestId = null;
                isProcessing = false;
            }
        }

        // 첫 배치 처리 시작
        processBatch();
    }

    // 고효율 스로틀 함수
    function throttle(fn, threshold = 100) {
        let last = 0;
        let timer = null;

        return function () {
            const now = Date.now();
            if (now - last < threshold) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    last = now;
                    fn();
                }, threshold);
            } else {
                last = now;
                fn();
            }
        };
    }

    // 초경량 이벤트 위임 설정
    function setupTabButtonEvents() {
        const tabArea = document.querySelector('.ArticleTab');
        if (!tabArea) return;

        tabArea.addEventListener('click', (e) => {
            const button = e.target.closest('.BoxTabListItem a');
            if (button) {
                // 비동기 배치로 실행하여 UI 차단 방지
                scheduleMultipleFilters(50);
            }
        });
    }

    // 다중 필터 스케줄링 (UI 프리징 방지)
    function scheduleMultipleFilters(delay = 50) {
        // 기존 요청 취소
        if (frameRequestId) {
            cancelAnimationFrame(frameRequestId);
            frameRequestId = null;
        }

        // 주요 시점에 맞춰 여러번 실행
        setTimeout(() => requestAnimationFrame(hideSellPosts), delay);
        setTimeout(() => requestAnimationFrame(hideSellPosts), delay + 300);
        setTimeout(() => requestAnimationFrame(hideSellPosts), delay + 600);
    }

    // 고성능 DOM 관찰
    function observeArticleList() {
        const targetNode = document.querySelector('ul.List.CommentArticleList');
        if (!targetNode) return false;

        const observer = new MutationObserver(throttle(() => {
            requestAnimationFrame(hideSellPosts);
        }, 50));

        observer.observe(targetNode, {
            childList: true,
            subtree: true  // 하위 요소 변경 감지 (중요)
        });

        return true;
    }

    // URL 변경 감지 (History API 사용)
    function watchNavigation() {
        let lastUrl = location.href;

        // URL 직접 감시
        const urlChecker = throttle(() => {
            if (lastUrl !== location.href) {
                lastUrl = location.href;
                setTimeout(() => {
                    if (!observeArticleList()) {
                        const checkExist = setInterval(() => {
                            if (observeArticleList()) {
                                hideSellPosts();
                                clearInterval(checkExist);
                            }
                        }, 200);
                    } else {
                        hideSellPosts();
                    }
                }, 300);
            }
        }, 500);

        // History API 오버라이드
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            urlChecker();
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            urlChecker();
        };

        // popstate 이벤트 리스너
        window.addEventListener('popstate', urlChecker);

        // 폴백 감지 메커니즘
        setInterval(urlChecker, 1000);
    }

    // 메인 초기화 함수
    function init() {
        // DOM 상태 확인
        if (!document.body) {
            setTimeout(init, 20);
            return;
        }

        setupTabButtonEvents();
        const isObserving = observeArticleList();

        if (isObserving) {
            hideSellPosts();
        } else {
            // DOM이 준비될 때까지 대기
            const checkExist = setInterval(() => {
                if (observeArticleList()) {
                    hideSellPosts();
                    clearInterval(checkExist);
                }
            }, 200);
        }

        // SPA 전환 감지
        watchNavigation();

        // 최적화된 스크롤 이벤트
        window.addEventListener('scroll', () => {
            // 스크롤 위치가 50px 이상 변경됐을 때만 처리
            if (Math.abs(window.scrollY - lastScrollY) > 50) {
                lastScrollY = window.scrollY;
                requestAnimationFrame(hideSellPosts);
            }
        }, { passive: true });

        // 필수 요소 변경 감지 (페이지 주요 변경점)
        const bodyObserver = new MutationObserver(throttle(hideSellPosts, 200));
        bodyObserver.observe(document.body, {
            childList: true,
            subtree: false
        });
    }

    // 최적화된 실행 시작점
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
