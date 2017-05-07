// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/// <reference path="jquery-3.1.0.min.js" />

var domainsWhiteList, domainsDelayedStart;
var currentDomainName;
var optionsUrl = chrome.extension.getURL("options.html");
var content = '<a href="' + optionsUrl + '" target="_blank">Options</a>';
var timeOut;
restoreDomainsFromCloud();
chrome.tabs.getSelected(null, function(tab) {
	//regex to get only domain name from current url
	currentDomainName = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
	currentDomainName = currentDomainName.replace(/^www./,'');
	$("#currentDomain").html(currentDomainName);
	displayDomainLocation(currentDomainName);
});

// Saves options to chrome.storage
function saveDomainToCloud() {
	var list = document.querySelector('input[name="list"]:checked').value;
	if(list == 'domainWhiteList'){
		if(typeof domainsWhiteList == 'undefined' || domainsWhiteList == null)
			domainsWhiteList = ';';
		if(domainsDelayedStart != null && domainsDelayedStart.indexOf(currentDomainName) > -1){
			messageToggleFade('Please remove from delayed start list before.');
		} else if(domainsWhiteList.indexOf(currentDomainName) == -1){
			domainsWhiteList += currentDomainName + ';';
			chrome.storage.sync.set({domainWhiteList: domainsWhiteList},
			  function() {
				messageToggleFade('\'' + currentDomainName + '\' added to the white list');
				displayDomainLocation(currentDomainName);
			});
		} else {
			messageToggleFade('\'' + currentDomainName + '\'' + ' already in the list.');
		}
	} else if(list == 'domainsDelayedStart'){
		if(typeof domainsDelayedStart == 'undefined' || domainsDelayedStart == null)
			domainsDelayedStart = ';';
		if(domainsWhiteList != null && domainsWhiteList.indexOf(currentDomainName) > -1){
			messageToggleFade('Please remove from white list before.');
		} else if(domainsDelayedStart.indexOf(currentDomainName) == -1){
			domainsDelayedStart += currentDomainName + ';';
			chrome.storage.sync.set({domainsDelayedStart: domainsDelayedStart},
			  function() {
				messageToggleFade('\'' + currentDomainName + '\' added to the delayed start list');
				displayDomainLocation(currentDomainName);
			});
		} else {
			messageToggleFade('\'' + currentDomainName + '\'' + ' already in the list.');
		}
	}
}
// Restores domains white list stored in chrome.storage.
function restoreDomainsFromCloud() {
	chrome.storage.sync.get("domainWhiteList", 
		function(data) {
			domainsWhiteList = data.domainWhiteList;
		});
	chrome.storage.sync.get("domainsDelayedStart", 
	function(data) {
		domainsDelayedStart = data.domainsDelayedStart;
	});
}
//display if the current domain in one of the lists.
function displayDomainLocation(domainName){
	if(domainsWhiteList != null && domainsWhiteList.indexOf(domainName) > -1){
	    $("#listDomain").html(" (In white list)").fadeIn(300);
	}
	else if(domainsDelayedStart != null && domainsDelayedStart.indexOf(currentDomainName) > -1){
			$("#listDomain").html(" (In delayed start list)").fadeIn(300);
	}
	else{
	 		$("#listDomain").fadeOut(300);
			setTimeout(function(){$("#listDomain").html("")}, 310);
	}
	
}

function closePopup(){
	setTimeout(window.close, 200);
}
//removes the current domain from the selected list (if it exist there)
function removeCurrentDomain(){
	var list = document.querySelector('input[name="list"]:checked').value;
	if(domainsWhiteList && domainsWhiteList.indexOf(currentDomainName) != -1 && list == 'domainWhiteList'){
		domainsWhiteList = domainsWhiteList.substring(0, domainsWhiteList.indexOf(currentDomainName)) +  
		domainsWhiteList.substring(domainsWhiteList.indexOf(currentDomainName) + currentDomainName.length + 1, domainsWhiteList.length);
		chrome.storage.sync.set({domainWhiteList: domainsWhiteList},
		  function() {
			messageToggleFade('\'' +  currentDomainName + '\' removed.');
			displayDomainLocation(currentDomainName);
		});
	} else if(domainsDelayedStart && domainsDelayedStart.indexOf(currentDomainName) != -1 && list == 'domainsDelayedStart'){
		domainsDelayedStart = domainsDelayedStart.substring(0, domainsDelayedStart.indexOf(currentDomainName)) +  
		domainsDelayedStart.substring(domainsDelayedStart.indexOf(currentDomainName) + currentDomainName.length + 1, domainsDelayedStart.length);
		chrome.storage.sync.set({domainsDelayedStart: domainsDelayedStart},
		  function() {
			messageToggleFade('\'' +  currentDomainName + '\' removed.');
			displayDomainLocation(currentDomainName);
		});
	}else{
		messageToggleFade('Nothing to remove.');
	}
}

function messageToggleFade(msg){
	if(	$('#status').html() != ""){
			clearTimeout(timeOut);
	}
	$('#status').html(msg);
	$('#status').fadeIn(1000, function(){ 
							timeOut = setTimeout(function(){ 
													$('#status').fadeOut(600); }, 2300)});
}

function immediateExecution(){
  chrome.tabs.executeScript({
    code: 'RemoveOverlayByZIndex();'
  });
  setTimeout(window.close, 800);  
}

//add event listeners to popup page
document.addEventListener('DOMContentLoaded', function() {
			document.getElementById('addToList').addEventListener('click',saveDomainToCloud);
			document.getElementById('removeFromList').addEventListener('click',removeCurrentDomain);
			document.getElementById('immediateExecution').addEventListener('click',immediateExecution);
			$('#options').html(content);
});