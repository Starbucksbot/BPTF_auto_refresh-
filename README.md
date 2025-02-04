# BPTF Auto refresh script for tampermonkey

Its based on the old code that existed I just updated it to avoid having to click on the button (I'm not lazy)
Useful for if you have a bot and you want that bp to update. Combine with an auto reload page? 

<a href="https://raw.githubusercontent.com/Starbucksbot/BPTF_auto_refresh-/main/autorefresh.user.js">
    Install BPTF Auto Refresh Userscript
</a>

## Some settings that are configurable depending on your needs. 
maxRefreshCount:
    The script will stop after this many refresh attempts
    Prevents infinite refreshing in case of errors
    Default: 20 refreshes (about 1 hour at 3-minute intervals)
refreshInterval:
    Time to wait between refresh attempts
    Backpack.tf may rate limit if too frequent
    Default: 180000ms (3 minutes)
maxAgeInHours
    Maximum allowed age of inventory data
    If inventory is newer than this, script stops
    Default: 0.1 hours (6 minutes)
retryInterval
    Time to wait between timestamp retrieval attempts
    Allows page to fully load between attempts
    Default: 20000ms (20 seconds)
maxRetryAttempts
    Maximum number of times to retry finding timestamp
    Prevents infinite retry loops
    Default: 6 attempts (2 minutes total with 20s intervals)
Increase maxRefreshCount for longer running sessions
Decrease refreshInterval for more frequent updates (but risk rate limiting)
Adjust maxAgeInHours based on how current you need your inventory data
