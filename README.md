# BPTF Auto refresh script for tampermonkey

Its based on the old code that existed I just updated it to avoid having to click on the button (I'm not lazy)
Useful for if you have a bot and you want that bp to update. Combine with an auto reload page? 

<a href="https://raw.githubusercontent.com/Starbucksbot/BPTF_auto_refresh-/main/autorefresh.user.js">
    Install BPTF Auto Refresh Userscript
</a>

## Some settings that are configurable depending on your needs. 
* maxRefreshCount = 900; // Maximum number of refresh attempts
* refreshInterval = 180000; // Time between refreshes (in ms, default: 3 min since bptf "mod" mald if its less... ) ![image](https://github.com/user-attachments/assets/66100e9b-2cc1-4c3f-a4da-b88acdb2ed76)
* maxAgeInHours = 0.1; // How old the inventory needs to be for the script to start auto refreshing without having to click the button. (In hours) Default 10 min
* retryInterval = 30000; // Retry interval when timestamp is missing (30 seconds) Keep this since it wont detect the time stamp on page load usually since bp takes a while to load
* maxRetryAttempts = 4; // Maximum number of retry attempts for missing timestamp
