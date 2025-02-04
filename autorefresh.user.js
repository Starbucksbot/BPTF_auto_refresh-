// ==UserScript==
// @name         Backpack.tf Auto Refresh (Fully automatic for the lazies of traders)
// @namespace    http://tampermonkey.net/
// @version      3.7
// @description  Automatically refreshes inventory using the api instead of just refresh
// @author       Starbucks
// @match        https://backpack.tf/profiles/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    GM_addStyle(`
        .btn-cyan {
            background-color: #00ffff !important;
            border-color: #00cccc !important;
            color: #000 !important;
        }
        .btn-cyan:hover {
            background-color: #00e6e6 !important;
        }
        #auto-refresh .api-count {
            margin-left: 5px;
            font-size: 0.8em;
            opacity: 0.8;
        }
    `);

    const config = {
        maxRefreshCount: 20,
        refreshInterval: 180000,
        maxAgeInHours: 0.1, // 6 minutes
        retryInterval: 20000,
        maxRetryAttempts: 6,
        apiEndpoint: "https://backpack.tf/api/inventory/"
    };

    let state = {
        refreshCount: 0,
        apiCallCount: 0,
        retryCount: 0,
        isRefreshing: false,
        steamId: null,
        intervalId: null,
        currentMethod: null,
        timestampRetries: 0
    };

    window.addEventListener("load", () => {
        console.log("[AUTO REFRESH] Page loaded, initializing...");
        state.steamId = extractSteamId();
        addAutoRefreshButton();
        setTimeout(() => startAutoRefresh(), 2000);
    });

    function extractSteamId() {
        return window.location.pathname.split("/").pop();
    }

    function addAutoRefreshButton() {
        const refreshButton = document.querySelector("#refresh-inventory");
        if (!refreshButton) return;

        const button = document.createElement("button");
        button.className = "btn btn-panel";
        button.innerHTML = `
            <i class="fa fa-refresh"></i>
            <span class="btn-text">Auto Refresh</span>
            <span class="api-count"></span>
        `;
        button.id = "auto-refresh";
        refreshButton.insertAdjacentElement('afterend', button);

        button.addEventListener("click", () => {
            if (!state.isRefreshing) {
                startAutoRefresh();
            } else {
                stopAutoRefresh("Manual stop");
                button.classList.add('btn-danger');
                setTimeout(() => button.classList.remove('btn-danger'), 2000);
            }
        });
    }

    async function startAutoRefresh(useHtmlFallback = false) {
        if (state.isRefreshing) return;

        state.isRefreshing = true;
        state.currentMethod = useHtmlFallback ? "html" : "api";
        updateButtonState();

        console.log(`[AUTO REFRESH] Starting ${state.currentMethod.toUpperCase()} refresh`);
        await performRefreshCycle();

        state.intervalId = setInterval(async () => {
            await performRefreshCycle();
        }, config.refreshInterval);
    }

    async function performRefreshCycle() {
        try {
            if (await checkPrivateInventory()) {
                stopAutoRefresh("Private inventory detected");
                return;
            }

            const timestamp = await getTimestampWithRetry();
            if (!timestamp) {
                console.warn("[TIMESTAMP] Could not find timestamp after retries");
                stopAutoRefresh("Timestamp not found");
                return;
            }

            const age = calculateAge(timestamp);
            console.log(`[AGE CHECK] Current age: ${age.toFixed(2)} hours`);

            if (age < config.maxAgeInHours) {
                console.log("[AGE CHECK] Inventory is current, stopping refresh");
                stopAutoRefresh("Inventory is current");
                return;
            }

            if (state.currentMethod === "html") {
                document.querySelector("#refresh-inventory").click();
            } else {
                await triggerApiRefresh();
                state.apiCallCount++;
            }

            state.refreshCount++;
            updateButtonState();
            checkRefreshLimits();
        } catch (error) {
            console.warn("[Refresh Error]", error);
            if (state.currentMethod === "api") {
                state.currentMethod = "html";
                updateButtonState();
            }
        }
    }

    async function getTimestampWithRetry() {
        state.timestampRetries = 0;
        while (state.timestampRetries < config.maxRetryAttempts) {
            const timestamp = await findTimestamp();
            if (timestamp) return timestamp;

            state.timestampRetries++;
            if (state.timestampRetries < config.maxRetryAttempts) {
                console.log(`[TIMESTAMP] Retrying in 20 seconds... (${state.timestampRetries}/${config.maxRetryAttempts})`);
                await sleep(config.retryInterval);
            }
        }
        return null;
    }

    async function findTimestamp() {
        try {
            // Try direct DOM access first
            const timeElement = document.querySelector("#inventory-time-label > time");
            if (timeElement) {
                return timeElement.getAttribute("datetime");
            }

            // Fallback to web scraping
            const response = await fetch(window.location.href);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const scrapedElement = doc.querySelector("#inventory-time-label > time");
            if (scrapedElement) {
                return scrapedElement.getAttribute("datetime");
            }

            // Final fallback: regex search
            const timestampMatch = text.match(/datetime="([^"]+)"/);
            if (timestampMatch) {
                return timestampMatch[1];
            }

            return null;
        } catch (error) {
            console.warn("[TIMESTAMP ERROR]", error);
            return null;
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function calculateAge(timestamp) {
        const lastUpdated = new Date(timestamp);
        return (Date.now() - lastUpdated) / (1000 * 60 * 60);
    }

    function triggerApiRefresh() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: `${config.apiEndpoint}${state.steamId}/refresh`,
                onload: (response) => {
                    if (response.status === 200) {
                        const data = JSON.parse(response.responseText);
                        logApiResponse(data);
                        resolve();
                    } else {
                        reject(new Error(`API Error: ${response.status}`));
                    }
                },
                onerror: reject
            });
        });
    }

    function logApiResponse(apiData) {
        const formattedTimes = {
            current: formatTimestamp(apiData.current_time * 1000),
            last_update: formatTimestamp(apiData.last_update * 1000),
            next_update: formatTimestamp(apiData.next_update * 1000),
            refresh_in: `${Math.floor((apiData.next_update - apiData.current_time) / 60)} minutes`
        };

        console.log("[API Response]", {
            ...apiData,
            ...formattedTimes
        });
    }

    function formatTimestamp(ms) {
        return new Date(ms).toLocaleString('en-GB', {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(',', '');
    }

    function updateButtonState() {
        const button = document.querySelector("#auto-refresh");
        if (!button) return;

        button.className = "btn btn-panel";
        const counter = button.querySelector(".api-count");
        counter.textContent = state.currentMethod === "api" ? `API: ${state.apiCallCount}` : '';

        if (state.isRefreshing) {
            button.classList.add(state.currentMethod === "api" ? "btn-success" : "btn-cyan");
            const method = state.currentMethod.toUpperCase();
            button.querySelector(".btn-text").textContent = `${method} Refreshing`;
        } else {
            button.querySelector(".btn-text").textContent = "Auto Refresh";
        }
    }

    function checkRefreshLimits() {
        if (state.refreshCount >= config.maxRefreshCount) {
            stopAutoRefresh("Refresh limit reached");
        }
    }

    function stopAutoRefresh(reason = "User request") {
        clearInterval(state.intervalId);
        state.isRefreshing = false;
        state.intervalId = null;
        updateButtonState();
        console.log(`[AUTO REFRESH] Stopped: ${reason}`);
    }

    async function checkPrivateInventory() {
        const errorLabel = document.querySelector("#inventory-error-label");
        if (errorLabel && errorLabel.textContent.includes("Private inventory")) {
            console.log("[PRIVATE INVENTORY] Detected private inventory");
            return true;
        }
        return false;
    }
})();
