// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Saves options to chrome.storage
function save_options() {
	var runningMode = document.optionsForm.runningMode.value;
	var aggressive_search_is_checked = (document.optionsForm.aggressiveSearch.checked != undefined) ? document.optionsForm.aggressiveSearch.checked : false;
	if(document.getElementById('cb_clearWhiteList').checked)
		chrome.storage.sync.remove('domainWhiteList', function(){});
	chrome.storage.sync.set({
	 preferedtiming: runningMode,
	 aggressiveSearch: aggressive_search_is_checked
	}, function() {
	 // Update status to let user know options were saved.
	 var status = document.getElementById('status');
	 status.textContent = 'Option saved.';
	 setTimeout(function() {status.textContent = '';}, 900);
	});
}

// Restores options state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    preferedtiming: 'onPageLoad',
	 aggressiveSearch: '',
	 domainWhiteList: ''
  }, function(items) {
	document.optionsForm.runningMode.value = items.preferedtiming;
	document.optionsForm.aggressiveSearch.checked = items.aggressiveSearch;
	if(!(typeof items.domainWhiteList == undefined || items.domainWhiteList == null || 
	items.domainWhiteList == ';' || items.domainWhiteList == 'domainWhiteList' || items.domainWhiteList == ''))
		document.optionsForm.whiteListText.value = items.domainWhiteList;
	else
		document.optionsForm.whiteListText.value = 'Empty!';
  });
}
//add event listeners to the buttons.
document.addEventListener('DOMContentLoaded', function() {
   document.getElementById('save').addEventListener('click',save_options);
	document.getElementById('close').addEventListener('click',function() {window.close();});
   restore_options();
});
