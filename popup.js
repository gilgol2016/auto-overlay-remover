// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var domainsWhiteList, domainsDelayedStart;
var currentHostname;
var optionsUrl = chrome.extension.getURL("options.html");
var content = '<a href="' + optionsUrl + '" target="_blank">Options</a>';

chrome.tabs.getSelected(null, function(tab) {
	//regex to get only hostname from current url
	currentHostname = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	currentHostname = currentHostname.replace(/^www./,'');
});

// Saves options to chrome.storage
function saveDomainToCloud() {
	var list = document.querySelector('input[name="list"]:checked').value;
	if(list == 'domainWhiteList'){
		if(typeof domainsWhiteList == 'undefined' || domainsWhiteList == null)
			domainsWhiteList = ';';
		if(domainsDelayedStart != null && domainsDelayedStart.indexOf(currentHostname) > -1){
			messageToggleFade('\'' + currentHostname + '\' already in delayed start list. Please remove it before saving.');
		} else if(domainsWhiteList.indexOf(currentHostname) == -1){
			domainsWhiteList += currentHostname + ';';
			chrome.storage.sync.set({domainWhiteList: domainsWhiteList},
			  function() {
				messageToggleFade('\'' + currentHostname + '\' added to the white list');
			});
		} else {
			messageToggleFade('\'' + currentHostname + '\'' + ' already in the list.');
		}
	} else if(list == 'domainsDelayedStart'){
		if(typeof domainsDelayedStart == 'undefined' || domainsDelayedStart == null)
			domainsDelayedStart = ';';
		if(domainsWhiteList != null && domainsWhiteList.indexOf(currentHostname) > -1){
			messageToggleFade('\'' + currentHostname + '\' already in the white list. Please remove it before saving.');
		} else if(domainsDelayedStart.indexOf(currentHostname) == -1){
			domainsDelayedStart += currentHostname + ';';
			chrome.storage.sync.set({domainsDelayedStart: domainsDelayedStart},
			  function() {
				messageToggleFade('\'' + currentHostname + '\' added to the delayed start list');
			});
		} else {
			messageToggleFade('\'' + currentHostname + '\'' + ' already in the list.');
		}
	}
}
// Restores domains white list stored in chrome.storage.
function restore_DomainFromCloud() {
	chrome.storage.sync.get("domainWhiteList", 
		function(data) {
			domainsWhiteList = data.domainWhiteList;
		});
	chrome.storage.sync.get("domainsDelayedStart", 
	function(data) {
		domainsDelayedStart = data.domainsDelayedStart;
	});
}
function closePopup(){
	setTimeout(window.close, 200);
}
function removeCurrentDomain(){
	var list = document.querySelector('input[name="list"]:checked').value;
	if(domainsWhiteList && domainsWhiteList.indexOf(currentHostname) != -1 && list == 'domainWhiteList'){
		domainsWhiteList = domainsWhiteList.substring(0, domainsWhiteList.indexOf(currentHostname)) +  
		domainsWhiteList.substring(domainsWhiteList.indexOf(currentHostname) + currentHostname.length + 1, domainsWhiteList.length);
		chrome.storage.sync.set({domainWhiteList: domainsWhiteList},
		  function() {
			messageToggleFade('\'' +  currentHostname + '\' removed.');
		});
	} else if(domainsDelayedStart && domainsDelayedStart.indexOf(currentHostname) != -1 && list == 'domainsDelayedStart'){
		domainsDelayedStart = domainsDelayedStart.substring(0, domainsDelayedStart.indexOf(currentHostname)) +  
		domainsDelayedStart.substring(domainsDelayedStart.indexOf(currentHostname) + currentHostname.length + 1, domainsDelayedStart.length);
		chrome.storage.sync.set({domainsDelayedStart: domainsDelayedStart},
		  function() {
			messageToggleFade('\'' +  currentHostname + '\' removed.');
		});
	}else{
		messageToggleFade('Nothing to remove.');
	}
}
function messageToggleFade(msg){
	$('#status').html(msg);
	$('#status').fadeIn(1000, function(){$('#status').delay(2300).fadeOut(1100);});
}
function run(){
  chrome.tabs.executeScript({
    code: 'RemoveOverlayByZIndex();'
  });
  setTimeout(window.close, 800);  
}
//add event listeners to popup page
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('addToList').addEventListener('click',saveDomainToCloud);
	document.getElementById('removeFromList').addEventListener('click',removeCurrentDomain);
	document.getElementById('run').addEventListener('click',run);
	$('#options').html(content);
});

restore_DomainFromCloud();

