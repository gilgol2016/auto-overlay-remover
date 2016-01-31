// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This is a script that will remove overlay popups in most of sites.
 * It's doing that by removing the highests layers (z-index).
 **/

var domainsWhiteList;
var interval;
var aggressiveMode = false;

// Restores domains white list stored in chrome.storage.
function restore_odomainWhiteListFromCloud() {
	chrome.storage.sync.get("domainWhiteList", 
		function(data) {
			domainsWhiteList = data.domainWhiteList;
			if(domainsWhiteList == null || domainsWhiteList.indexOf(getCurrentHostName()) == -1){
					delayeStartOptions()
			};
		});
}

function getSearchOverlayMode(){
	chrome.storage.sync.get("aggressiveSearch", 
	function(data) {
		aggressiveMode = data.aggressiveSearch;
	});
}

function getCurrentHostName() {
	var currentHostname = window.location.hostname;
	currentHostname = currentHostname.replace(/^www./,'');
	return currentHostname;
}

//remove overlay with higher z-index than overlay background layer
function RemoveOverlayByZIndex()
{
	var elems = document.getElementsByTagName('div');
	var highest = 0;
	var j = 0;
	for (var i = 0; i < elems.length; i++)
	{
		var zindex = window.getComputedStyle(elems[i],null).getPropertyValue("z-index");
		var opacity = window.getComputedStyle(elems[i],null).getPropertyValue("opacity");
		if ((opacity > 0.1 && opacity < 1) && (parseInt(zindex) > 10) && (zindex != 'auto'))
		{
			highest = zindex;
			elems[i].style.setProperty("display", "none", "important");
			for (j = 0 ; j < elems.length; j++){
				var new_zindex = window.getComputedStyle(elems[j],null).getPropertyValue("z-index");
				
				if((parseInt(new_zindex) >= parseInt(highest)) && (parseInt(highest) > 0)){
					elems[j].style.setProperty("display", "none", "important");
				}
			}
			if(!aggressiveMode)
				clearInterval(interval);
		}
	}
}

function runOverlayRemover(timeMilli){
	interval = setInterval(RemoveOverlayByZIndex, 250);
	setTimeout(function(){clearInterval(interval);},timeMilli);
}

function delayeStartOptions() {
  // Use default value runningMode = 'onPageLoad'.
	chrome.storage.sync.get({
		preferedtiming: 'onPageLoad'
		}, function(items) {
			switch (items.preferedtiming){
			case 'immediately':
				runOverlayRemover(13000);
				break;
			case 'onPageLoad':
				var loadfunction = window.onload;
				window.onload = function(event){
					runOverlayRemover(10000);
					if(loadfunction) loadfunction(event);
				}
				break;
			case 'delayed':
				setTimeout(runOverlayRemover,8000, 13000);
				break;
			default:
				runOverlayRemover(10000);
				break;
			}
	});
}

getSearchOverlayMode();
restore_odomainWhiteListFromCloud();
