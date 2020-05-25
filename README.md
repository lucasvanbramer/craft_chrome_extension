# craft_chrome_extension

This is a Chrome extension integrating CRAFT into the Reddit user experience. 

As you write a new comment, this extension runs CRAFT on both the comments to 
which you are replying and the new content you are contributing in order to
inform you about how your comment contributes to the predicted hostility of the conversation.

### How it works:

When you load old.reddit.com, oldRedditContentScript.js is added to the page's javascript. 
This script sends the content of the comments you are replying to as soon as you click "reply", 
then sends a request to our CRAFT server once every five seconds as you type your comment out.
It annotates the page with the CRAFT scores of all these comments, and optionally colors them
with a shade of red commensurate with the predicted hostility of the conversation at that point.

Note: This extension currently only works with the old version of reddit because the new version does not use basic textareas for writing replies: One may be able to play with oldRedditContentScript.js to achieve similar results on new reddit, but there will be a bit of work involved to correctly capture interactions with the dynamic <span> that is used by default on new reddit for text entry.
