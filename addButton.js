chrome.runtime.getURL("index.js")
COPY_URL_BUTTON_ID = "jira-copy-friendly-link-trigger";
SHARE_BUTTON_ID = "jira-share-trigger";
TITLE_ID = "summary-val";
ISSUE_NUMBER_ID = "key-val";

function echoDOM (results) {
  if (results != null) {
    console.log(results);
  } else {
    console.log("null DOM");
  }

}

var shareElement = document.getElementById(SHARE_BUTTON_ID);
if (shareElement == null) {
  console.log("Not Jira");
} else {
  var copyElement = shareElement.cloneNode(true);
  copyElement.id = COPY_URL_BUTTON_ID;
  copyElement.lastElementChild.innerText = "Copy Friendly URL";
  copyElement.firstElementChild.classList.remove("aui-iconfont-share");
  copyElement.firstElementChild.classList.add("aui-iconfont-link")

  var barElement = document.getElementById("opsbar-jira.issue.tools");
  barElement.insertBefore(copyElement, barElement.childNodes[0]);
  document.getElementById(COPY_URL_BUTTON_ID).addEventListener("click", echo);
}

function echo() {
  var title = document.getElementById(TITLE_ID).innerText;
  var issueNum = document.getElementById(ISSUE_NUMBER_ID).innerText;
  chrome.runtime.sendMessage({type: "copyFriendlyUrl", title:title, issueNum: issueNum});
}
