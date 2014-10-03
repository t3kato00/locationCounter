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
			};
			app.setTabs();
			app.tabs[app.activeTab]();
		}
	, handlerOnTabClick: function(name)
		{	return function () {
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

			for( var key in app.tabs ) {
				var n = count;
				count += 1;
				var id = 'tabSwitch_' + n;
				shows[id] = app.handlerOnTabClick(key);

				var evenOdd = 'Even';
				if( n % 2 ) evenOdd = 'Odd';

				if( key == app.activeTab ) {
					content += '<a id="' + id + '" class="tabSwitcher tabSwitcher' + evenOdd + ' activeTab">' + key + '</span>'
				} else {
					content += '<a id="' + id + '" class="tabSwitcher tabSwitcher' + evenOdd + '">' + key + '</span>'
				}
			}

			$('#tabs').html(content);
			for( var id in shows ) {
				$('#'+id).on("click", shows[id]);
			}
		}
	, setMain: function( inside )
		{
			//document.getElementById("main").innerHTML = inside;
			$('#main').html(inside);
		}
	, tabs:
		{ "Add place": function()
			{
				var content =
					'<table class="form">' +
					'<tr><td>Name:</td><td><input type="text" id="apName"></td></tr>' +
					'<tr><td>Radius:</td><td><input type="text" id="apRadius"></td></tr>' +
					'</table>' +
					'<button type="button" id="apSubmit">Submit</button>';
				app.setMain( content );
				$('#apSubmit').on("click", function () {
					var name = document.getElementById("apName").value;
					var radius = parseFloat(document.getElementById("apRadius").value);
					if(isNaN(radius)) {
						alert('Invalid radius!');
						return;
					}
				});
			}
		, "Statistics": function()
			{
				app.setMain( "Statistics" );
			}
		, "Place Debug": function()
			{

				var content =
					'<table class="form">' +
					'<tr><td>Latitude:</td><td><input type="text" id="apLat"></td></tr>' +
					'<tr><td>Longitude:</td><td><input type="text" id="apLon"></td></tr>' +
					'<tr><td>Radius:</td><td><input type="text" id="apRadius"></td></tr>' +
					'</table>' +
					'<button type="button" id="apSubmit">Submit</button>';

				if( app['placeDebug'] )
				{
					var dbg = app.placeDebug;
					content +=
						'<table class="form">' +
						'<tr><td>Latitude:</td><td>' + geoMath.rad2deg(dbg.latitude) + '</td></tr>' +
						'<tr><td>Longitude:</td><td>' + geoMath.rad2deg(dbg.longitude) + '</td></tr>' +
						'<tr><td>Radius:</td><td>' + geoMath.rangle2meters(dbg.rangle) + '</td></tr>' +
						'</table>';
				}

				app.setMain( content );
				$('#apSubmit').on("click", function () {
					var latitude = geoMath.deg2rad(parseFloat(document.getElementById("apLat").value));
					var longitude = geoMath.deg2rad(parseFloat(document.getElementById("apLon").value));
					var radius = parseFloat(document.getElementById("apRadius").value);
					if(isNaN(latitude) || latitude > 0.5*Math.PI || latitude < -0.5*Math.PI ) {
						alert('Invalid latitude!');
						return;
					}
					if(isNaN(longitude) || longitude > Math.PI || longitude < -Math.PI ) {
						alert('Invalid longitude!');
						return;
					}
					if(isNaN(radius)) {
						alert('Invalid radius!');
						return;
					}

					if( app['placeDebug'] )
					{
						app.placeDebug = geoMath.placeAdd(app.placeDebug, { latitude: latitude, longitude: longitude, accuracy: radius } );
					}
					else
					{
						app.placeDebug = geoMath.placePoint( { latitude: latitude, longitude: longitude, accuracy: radius } );
					}

					app.tabs['Place Debug']();
				});
			}
		}
	// Currently active tab.
	, activeTab: "Statistics"
	};

