COPY_URL_BUTTON_ID = "jira-copy-friendly-link-trigger";
SHARE_BUTTON_ID = "jira-share-trigger";
TITLE_ID = "summary-val";
ISSUE_NUMBER_ID = "key-val";


chrome.contextMenus.create({
  "id":"copyAsPlainText",
  "title": "Copy Jira friendly link"
});

chrome.contextMenus.onClicked.addListener(function(itemData){
  copyToClipboard(null);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    resetValues();
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.type == "copyFriendlyUrl")
      console.log(request);
      jiraTitle = request.title;
      jiraIssueNum = request.issueNum;
      jiraUrl = sender.tab.url;
      copyFinal();
  }
);

var jiraUrl;
var jiraTitle;
var jiraIssueNum;

function resetValues() {
  jiraUrl = null;
  jiraTitle = null;
  jiraIssueNum = null;
}
const copyToClipboard = str => {
  console.log("Started copyToClipboard - Get elements and query Tab URL");

  resetValues();

  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      var tab = tabs[0];
      console.log(tabs.length);
      let url = tabs[0].url;

      jiraUrl = url;
      checkIfReady();

      executeScript(TITLE_ID, setTitle);

      executeScript(ISSUE_NUMBER_ID, setIssueNum);
  });
};

function executeScript(id, callback) {
  chrome.tabs.executeScript({
    code: 'document.getElementById("' + id + '").innerText'
  }, results => callback(results));
}

function setTitle(results) {
  console.log("Set title to: " + results);
  if (!results || results == "") {
    alert("Failed to find issue title - probably not a valid Jira Page");
  }
  jiraTitle = results;
  checkIfReady();
}

function setIssueNum(results) {
  console.log("Set issueNum to: " + results);
  jiraIssueNum = results;
  checkIfReady();
}

function checkIfReady(shouldEnforce) {
  var ready = !(!jiraUrl || !jiraTitle || !jiraIssueNum);
  // alert("Ready: " + ready + " --- shouldEnforce: " + shouldEnforce);
  if (ready == false && shouldEnforce == true) {
    alert("Failed to copy Jira info - Please contact the Developer");
    return true;
  }

  if (ready == true && !shouldEnforce) {
    copyFinal();
  }
}

function copyFinal() {
  // alert(jiraUrl);
  // alert(jiraTitle);
  // alert(jiraIssueNum);

  var stop = checkIfReady(true);
  if (stop == true) {
    return;
  }
  const linkElement = document.createElement('a');
  linkElement.innerText = "[" + jiraIssueNum + "] - " + jiraTitle;
  linkElement.setAttribute('href', jiraUrl);
  console.log(linkElement);
  linkElement.style.position = 'absolute';
  linkElement.style.left = '-9999px';
  document.body.appendChild(linkElement);
  const range = document.createRange();
  range.selectNode(linkElement);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  document.body.removeChild(linkElement);
};
