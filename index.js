chrome.contextMenus.create({
  "id":"copyAsPlainText",
  "title": "Copy friendly Jira link"
});

chrome.contextMenus.onClicked.addListener(function(itemData){
  copyToClipboard(itemData.selectionText);
});

var jiraUrl;
var jiraTitle;
var jiraIssueNum;


const copyToClipboard = str => {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      var tab = tabs[0];

      let url = tabs[0].url;
      jiraUrl = url;
      checkIfReady();

      chrome.tabs.executeScript({
        code: 'document.getElementById("summary-val").innerText'
      }, results => setTitle(results));

      chrome.tabs.executeScript({
        code: 'document.getElementById("key-val").innerText'
      }, results => setIssueNum(results));
      // use `url` here inside the callback because it's asynchronous!
  });
};

function setTitle(results) {
  if (!results || results == "") {
    alert("Failed to find issue title - probably not a valid Jira Page");
  }
  jiraTitle = results;
  checkIfReady();
}

function setIssueNum(results) {
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
  linkElement.innerText = jiraIssueNum + " - " + jiraTitle;
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
