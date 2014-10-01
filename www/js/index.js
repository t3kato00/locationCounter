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
				release();
				app.activeTab = name;
				app.setTabs();
				app.tabs[name]();
			 }
		}
	// Refresh tabs.
	, setTabs: function()
		{
			var content = '';
			var shows = {};
			var count = 0;
			var release = function() {
					for( var id2 in shows ) {
						document.getElementById(id2).removeEventListener("click", shows[id2]);
					}
				}

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
		}
	, setMain: function( inside )
		{
			document.getElementById("main").innerHTML = inside;
		}
	, tabs:
		{ "Test tab": function()
			{
				app.setMain( "Test tab!" );
			}
		, "Test tab 2": function()
			{
				app.setMain( "Test tab 2!" );
			}
		}
	// Currently active tab.
	, activeTab: "Test tab"
	};

