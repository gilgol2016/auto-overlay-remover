// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var domainsWhiteList;
var currentHostname;
var optionsUrl = chrome.extension.getURL("options.html");
var content = '<a href="' + optionsUrl + '" target="_blank">Options</a>';

chrome.tabs.getSelected(null, function(tab) {
	//regex to get only hostname from current url
	currentHostname = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	currentHostname = currentHostname.replace(/^www./,'');
});

// Saves options to chrome.storage
function save_domain2Cloud() {
	var status = document.getElementById('status');
	if(typeof domainsWhiteList == 'undefined' || domainsWhiteList == null)
		domainsWhiteList = ';';
	if(domainsWhiteList.indexOf(currentHostname) == -1){
		domainsWhiteList += currentHostname + ';';
		chrome.storage.sync.set({domainWhiteList: domainsWhiteList},
		  function() {
			status.innerHTML = '\'' + currentHostname + '\' added to the white list';
		});
	} else {
		status.innerHTML = '\'' + currentHostname + '\'' + ' already in the list.';
	}
}

// Restores domains white list stored in chrome.storage.
function restore_odomain2Cloud() {
	chrome.storage.sync.get("domainWhiteList", 
		function(data) {
			domainsWhiteList = data.domainWhiteList;
		});
}
function saveAndClosePopup(){
	save_domain2Cloud();
}
function closePopup(){
	setTimeout(window.close, 200);
}
function removeCurrentDomain(){
	var status = document.getElementById('status');
	if(domainsWhiteList.indexOf(currentHostname) != -1){
		domainsWhiteList = domainsWhiteList.substring(0, domainsWhiteList.indexOf(currentHostname)) +  
			domainsWhiteList.substring(domainsWhiteList.indexOf(currentHostname) + currentHostname.length + 1, domainsWhiteList.length);
		chrome.storage.sync.set({domainWhiteList: domainsWhiteList},
		  function() {
			status.innerHTML = '\'' +  currentHostname + '\' removed.';
		});
	} else{
		status.innerHTML = 'Nothing to remove.';
	}
}

function run(){
  chrome.tabs.executeScript({
    code: 'RemoveOverlayByZIndex();'
  });
  setTimeout(window.close, 800);  
}
//add event listeners to popup page
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('add').addEventListener('click',saveAndClosePopup);
	document.getElementById('close').addEventListener('click',closePopup);
	document.getElementById('remove').addEventListener('click',removeCurrentDomain);
	document.getElementById('run').addEventListener('click',run);
	document.getElementById('options').innerHTML = content;
});

restore_odomain2Cloud();

