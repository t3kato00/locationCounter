/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app =
	// Application Constructor
	{ initialize: function()
		{
			this.bindEvents();
		}
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	, bindEvents: function()
		{
			document.addEventListener('deviceready', this.onDeviceReady, false);
		}
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	, onDeviceReady: function()
		{
			window.onerror = function myErrorHandler(msg, url, line) {
				app.setMain( '<b>Error! ' + url + ' (' + line + ')<br></b>' + msg);
				return false;
			}
			app.setTabs();
			app.tabs[app.activeTab]();
		}
	, handlerOnTabClick: function(name,release)
		{	return function () {
				release.release();
				app.activeTab = name;
				app.setTabs();
				app.tabs[name]();
			 }
		}
	, handlerOnTabClickRelease: function(shows)
		{ return function () {
				for( var id in shows ) {
					document.getElementById(id).removeEventListener("click", shows[id]);
				}
			}
		}
	// Refresh tabs.
	, setTabs: function()
		{
			var content = '';
			var shows = {};
			var count = 0;
			var release = {};

			for( var key in app.tabs ) {
				var n = count;
				count += 1;
				var id = 'tabSwitch_' + n;
				shows[id] = app.handlerOnTabClick(key,release);

				var evenOdd = 'Even';
				if( n % 2 ) evenOdd = 'Odd';

				if( key == app.activeTab ) {
					content += '<a id="' + id + '" class="tabSwitcher tabSwitcher' + evenOdd + ' activeTab">' + key + '</span>'
				} else {
					content += '<a id="' + id + '" class="tabSwitcher tabSwitcher' + evenOdd + '">' + key + '</span>'
				}
			}

			document.getElementById("tabs").innerHTML = content;
			for( var id in shows ) {
				document.getElementById(id).addEventListener("click", shows[id]);
			}
			release['release'] = app.handlerOnTabClickRelease(shows);
		}
	, setMain: function( inside )
		{
			document.getElementById("main").innerHTML = inside;
		}
	, tabs:
		{ "Add place": function()
			{
				var content =
					'<table class="form">' +
					'<tr><td>Name:</td><td><input type="text" id="apName"></tr>' +
					'<tr><td>Radius:</td><td><input type="text" id="apRadius"></td></tr>' +
					'</table>' +
					'<button type="button" id="apSubmit">Submit</button>';
				app.setMain( content );
				var onSubmit = function () {
					var name = document.getElementById("apName").value;
					var radius = parseFloat(document.getElementById("apRadius").value);
					if(isNaN(radius)) {
						alert('Invalid radius!');
						return;
					}
				}
				document.getElementById("apSubmit").addEventListener("click", onSubmit);
			}
		, "Statistics": function()
			{
				app.setMain( "Statistics" );
			}
		}
	// Currently active tab.
	, activeTab: "Statistics"
	};

