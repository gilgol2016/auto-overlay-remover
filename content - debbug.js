// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This script will remove overlay popups in most of sites.
 * It does that, in most cases, by removing the highests layers (z-index).
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
		var elmnt_zindex = window.getComputedStyle(elems[i],null).getPropertyValue("z-index");
		var elmnt_opacity = Number(window.getComputedStyle(elems[i],null).getPropertyValue("opacity"));		
		var elmnt_height = window.getComputedStyle(elems[i],null).getPropertyValue("height");
		var elmnt_width = window.getComputedStyle(elems[i],null).getPropertyValue("width");
        var element_position = window.getComputedStyle(elems[i],null).getPropertyValue("position");
		var isElementFullScreenSize = false;
		var elmnt_rgba_color = document.defaultView.getComputedStyle(elems[i],null).getPropertyValue("background-color");
		var rgba_opacity_value = 1;
        
        //check if there is opacity value < 1 in Backgound-color (RGBA)
		if(elmnt_rgba_color != null && elmnt_rgba_color != '' && elmnt_rgba_color.includes("rgba")){
			var rgbaOacityStartIndex = elmnt_rgba_color.lastIndexOf(',') + 1; 
			var rgbaOacityEndIndex = elmnt_rgba_color.lastIndexOf(')');
			rgba_opacity_value =Number(elmnt_rgba_color.substring(rgbaOacityStartIndex,rgbaOacityEndIndex));
		}
        //size of element is at least size of client size (-18px -> where overlay not cover height scroller)
        if ((document.documentElement.clientWidth != null && (Number(elmnt_width.replace('px', '')) >= document.documentElement.clientWidth - 18) || (elmnt_width == '100%' ) || (elmnt_width == 'auto' )) && 
                (document.documentElement.clientHeight != null && (Number(elmnt_height.replace('px', '')) >= document.documentElement.clientHeight) || (elmnt_height == '100%' ) || (elmnt_height == 'auto' ))) {
                isElementFullScreenSize = true;
		}
        //remove overlay when there is no z-index
        if(isElementFullScreenSize 
            && ((elmnt_opacity > 0.1 && elmnt_opacity < 1) || (rgba_opacity_value < 1)) 
            && (elmnt_zindex == '' || elmnt_zindex == null || elmnt_zindex == 'auto' || elmnt_zindex == '0') 
            && (element_position != null && (element_position == 'fixed' || element_position == 'absolute'))){
                elems[i].style.setProperty("display", "none", "important");
        } 
        //search & remove z-indexed overlay background
        if (isElementFullScreenSize
            && ((elmnt_opacity > 0.1 && elmnt_opacity < 1) || (rgba_opacity_value >= 0 && rgba_opacity_value < 1))
            && (parseInt(elmnt_zindex) > 40 && elmnt_zindex != 'auto' ) 
            && (element_position != null && (element_position == 'fixed' || element_position == 'absolute')))
		{
			console.log('%c BG - Elemid:' + i + ' className:' + elems[i].className + ' zIndex:' + elmnt_zindex + ' opacity:' + elmnt_opacity + ' rgba:' + elmnt_rgba_color, 'color:DodgerBlue;');
			highest = parseInt(elmnt_zindex);
			elems[i].style.setProperty("display", "none", "important");
			//search & remove overlay popup content
            for (j = 0 ; j < elems.length; j++) {
				var new_zindex = parseInt(window.getComputedStyle(elems[j],null).getPropertyValue("z-index"));
				
				if((new_zindex >= highest) && (highest > 0)){
					elems[j].style.setProperty("display", "none", "important");
					console.log('className-J:' + elems[j].className + ' Elemid(j):' + j  + ' new_zindex:' + new_zindex + ' parent zIndex:' + highest);
                    //j = elems.length;
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