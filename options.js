let hidecolorelse = document.getElementById("hidecolorelse");
let hidecolorself = document.getElementById("hidecolorself");
let hidenumberelse = document.getElementById("hidenumberelse");
let hidenumberself = document.getElementById("hidenumberself");

chrome.storage.sync.get(["hidecolorelse", "hidecolorself", "hidenumberelse", "hidenumberself"], function (v) {
  hidecolorelse.checked = v["hidecolorelse"];
  hidecolorself.checked = v["hidecolorself"];
  hidenumberelse.checked = v["hidenumberelse"];
  hidenumberself.checked = v["hidenumberself"];
});

hidecolorelse.onclick = function (e) {
  chrome.storage.sync.get(["hidecolorelse"], function (v) {
    chrome.storage.sync.set({ "hidecolorelse": !v["hidecolorelse"] });
  });
}

hidecolorself.onclick = function (e) {
  chrome.storage.sync.get(["hidecolorself"], function (v) {
    chrome.storage.sync.set({ "hidecolorself": !v["hidecolorself"] });
  });
}

hidenumberelse.onclick = function (e) {
  chrome.storage.sync.get(["hidenumberelse"], function (v) {
    chrome.storage.sync.set({ "hidenumberelse": !v["hidenumberelse"] });
  });
}

hidenumberself.onclick = function (e) {
  chrome.storage.sync.get(["hidenumberself"], function (v) {
    chrome.storage.sync.set({ "hidenumberself": !v["hidenumberself"] });
  });
}