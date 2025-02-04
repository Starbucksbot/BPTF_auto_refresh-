# BPTF Auto refresh script for tampermonkey

Its based on the old code that existed I just updated it to avoid having to click on the button (I'm not lazy)
Useful for if you have a bot and you want that bp to update. Combine with an auto reload page? 

<a href="https://raw.githubusercontent.com/Starbucksbot/BPTF_auto_refresh-/main/autorefresh.user.js">
    Install BPTF Auto Refresh Userscript
</a>

## Some settings that are configurable depending on your needs. 
### `maxRefreshCount`
- **Purpose**: Prevents infinite refreshing in case of errors
- **Default**: 20 refreshes (about 1 hour at 3-minute intervals)
- **Recommendation**: Increase for longer running sessions

### `refreshInterval`
- **Purpose**: Controls how often the script attempts to refresh
- **Default**: 180000ms (3 minutes)
- **Note**: Backpack.tf may rate limit if set too low

### `maxAgeInHours`
- **Purpose**: Determines how current the inventory data should be
- **Default**: 0.1 hours (6 minutes)
- **Usage**: Script stops when inventory is newer than this value

### `retryInterval`
- **Purpose**: Time between timestamp retrieval attempts
- **Default**: 20000ms (20 seconds)
- **Note**: Allows page to fully load between attempts

### `maxRetryAttempts`
- **Purpose**: Limits how many times the script tries to find the timestamp
- **Default**: 6 attempts (2 minutes total with 20s intervals)
- **Recommendation**: Increase if page loading is slow


-Increase maxRefreshCount for longer running sessions
-Decrease refreshInterval for more frequent updates (but risk rate limiting)
-Adjust maxAgeInHours based on how current you need your inventory data
