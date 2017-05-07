// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * This script will remove overlay popups in most of sites.
 * It does that, in most cases, by removing the highests layers (z-index).
 **/

var domainsWhiteList,domainsDelayedStart;
var interval;
var aggressiveMode = false;

// Restores domains white list stored in chrome.storage.
function restore_domainWhiteListFromCloud() {
	chrome.storage.sync.get("domainWhiteList", 
		function(data) {
			domainsWhiteList = data.domainWhiteList;
			if(domainsWhiteList == null || domainsWhiteList.indexOf(getCurrentDomainName()) == -1){
				chrome.storage.sync.get("domainsDelayedStart", 
					function(data2) {
						domainsDelayedStart = data2.domainsDelayedStart;
						if(domainsDelayedStart != null && domainsDelayedStart.indexOf(getCurrentDomainName()) > -1){
								delayeStartOptions(true);
						} else{
							delayeStartOptions(false);
						}
				});
			};
	});
}

function getSearchOverlayMode(){
	chrome.storage.sync.get("aggressiveSearch", 
	function(data) {
		aggressiveMode = data.aggressiveSearch;
	});
}

function getCurrentDomainName() {
	var currentDomainName = window.location.hostname;
	currentDomainName = currentDomainName.replace(/^www./,'');
	return currentDomainName;
}

//remove overlay with higher z-index than overlay background layer
function RemoveOverlayByZIndex()
{
	var allDivsElements = document.getElementsByTagName('div');
	var highest = 0;
	var j = 0;
    var toEnableScroll = false; 
	var fancyboxClassName = "fancybox-overlay"; //when overlay done by fancybox tool

	for (var i = 0; i < allDivsElements.length; i++)
	{
		var currentElementStyle = window.getComputedStyle(allDivsElements[i],null);
		var elementZindex = currentElementStyle.getPropertyValue("z-index");
		var elementOpacity = Number(currentElementStyle.getPropertyValue("opacity"));		
		var elementHeight = currentElementStyle.getPropertyValue("height");
		var elementWidth = currentElementStyle.getPropertyValue("width");
        var elementPosition = currentElementStyle.getPropertyValue("position");
		var elementRgbaColor = document.defaultView.getComputedStyle(allDivsElements[i],null).getPropertyValue("background-color");
        var elementVisualWidth = allDivsElements[i].offsetWidth;
		var elementVisualHeight = allDivsElements[i].offsetHeight;
		var isElementFullScreenSize = false;
		var rgbaOpacityValue = 1;
        var noPaddingMarginsTopBottom = false, noPaddingMarginRightLeft = false;

        //check if there is opacity value < 1 in Backgound-color (RGBA)
		if(elementRgbaColor != null && elementRgbaColor != '' && elementRgbaColor.includes("rgba")){
			var rgbaOacityStartIndex = elementRgbaColor.lastIndexOf(',') + 1; 
			var rgbaOacityEndIndex = elementRgbaColor.lastIndexOf(')');
			rgbaOpacityValue =Number(elementRgbaColor.substring(rgbaOacityStartIndex,rgbaOacityEndIndex));
		}

		if ((elementVisualWidth > 1) && (elementWidth == '100%' || elementWidth == 'auto' ) && currentElementStyle.getPropertyValue("padding-left") == '0px' &&  
			currentElementStyle.getPropertyValue("padding-right") == '0px' && currentElementStyle.getPropertyValue("margin-left") == '0px'
			&& currentElementStyle.getPropertyValue("margin-right") == '0px') {
				noPaddingMarginRightLeft = true;
		}
		if ((elementVisualHeight > 1) && (elementHeight == '100%' || elementHeight == 'auto' ) && currentElementStyle.getPropertyValue("padding-top") == '0px' &&  
			currentElementStyle.getPropertyValue("padding-bottom") == '0px' && currentElementStyle.getPropertyValue("margin-top") == '0px'
			&& currentElementStyle.getPropertyValue("margin-bottom") == '0px') {
				noPaddingMarginsTopBottom = true;
		}
		//size of element is at least size of client size (-18px -> where overlay not cover height scroller)
        if ((document.documentElement.clientWidth != null && (elementVisualWidth >= document.documentElement.clientWidth - 18) || noPaddingMarginRightLeft) && 
                (document.documentElement.clientHeight != null && (elementVisualHeight >= document.documentElement.clientHeight) || noPaddingMarginsTopBottom)) {
                isElementFullScreenSize = true;
		}
        //remove overlay when there is no z-index
        if(isElementFullScreenSize 
            && ((elementOpacity > 0.1 && elementOpacity < 1) || (elementRgbaColor != 'rgba(0, 0, 0, 0)' && rgbaOpacityValue < 1)) 
            && (elementZindex == '' || elementZindex == null || elementZindex == 'auto' || elementZindex == '0') 
            && (elementPosition != null && (elementPosition == 'fixed' || elementPosition == 'absolute'))){
                allDivsElements[i].style.setProperty("display", "none", "important");
                toEnableScroll = true;
        } 

        //search & remove z-indexed overlay background
        if (isElementFullScreenSize
            && ((elementOpacity > 0.1 && elementOpacity < 1) || (rgbaOpacityValue > 0 && rgbaOpacityValue < 1) || (allDivsElements[i].className.includes(fancyboxClassName)))
            && (parseInt(elementZindex) > 40 && elementZindex != 'auto' ) 
            && (elementPosition != null && (elementPosition == 'fixed' || elementPosition == 'absolute')))
		{
			highest = parseInt(elementZindex);
			allDivsElements[i].style.setProperty("display", "none", "important");
            toEnableScroll = true;
			//search & remove overlay popup content
            for (j = 0 ; j < allDivsElements.length; j++) {
				var new_zindex = parseInt(window.getComputedStyle(allDivsElements[j],null).getPropertyValue("z-index"));
				if((new_zindex >= highest) && (highest > 0)){
					allDivsElements[j].style.setProperty("display", "none", "important");
				}
			}
			if(!aggressiveMode)
				clearInterval(interval);
		}
	}

    if (toEnableScroll) {
		document.body.style.setProperty("overflow-y", "auto" ,"important");
		document.getElementsByTagName("html")[0].style.setProperty("overflow-y", "auto" ,"important");
    }
}
function runOverlayRemover(timeMilli){
	interval = setInterval(RemoveOverlayByZIndex, 250);
	setTimeout(function(){clearInterval(interval);},timeMilli);
}

function delayeStartOptions(isDelayed) {
  // Use default value runningMode = 'onPageLoad'.
	chrome.storage.sync.get({
	 	delayDuration: '',		
		preferedtiming: 'onPageLoad'
		}, function(items) {
			if (isDelayed) {
				items.preferedtiming = 'delayed';
			}
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
				setTimeout(runOverlayRemover,+items.delayDuration * 1000, 13000);
				break;
			default:
				runOverlayRemover(10000);
				break;
			}
	   }
    );
}
getSearchOverlayMode();
restore_domainWhiteListFromCloud();