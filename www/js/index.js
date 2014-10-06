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
			app.positionStatus = '';
			window.onerror = function myErrorHandler(msg, url, line) {
				app.setMain( '<b>Error! ' + url + ' (' + line + ')<br></b>' + msg);
				return false;
			};
			app.setPosition('Pending', 'pending');
			app.setTabs();
			app.tabs[app.activeTab]();
		}
	, setPosition: function( inside, style )
		{
			var elem = $('#position');
			if( !inside )
			{
				elem.slideUp( function() { elem.html('') } );
				return;
			}

			style = style || '';
			if( style != app.positionStatus )
			{
				if( app.positionStatus != '' )
					elem.removeClass(app.positionStatus);
				if( style != '' ) 
					elem.addClass(style);
				app.positionStatus = style;
			}

			elem.html(inside).slideDown();
		}
	, handlerOnTabClick: function(name)
		{	return function()
			{
				if( app.activeTab == name )
					return;

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
		, "Debug": function()
			{
				var sect = function(text) {
					return '<h2>' + text + '</h2>';
				}
				var head = function(text) {
					return '<h3>' + text + '</h3>';
				}
				var coords = function(coords) {
					var result = '<table>' +
						'<tr><td>Latitude</td><td>' + geoMath.rad2deg(coords.latitude) + '</td></tr>' +
						'<tr><td>Longitude</td><td>' + geoMath.rad2deg(coords.longitude) + '</td></tr>';

					if('accuracy' in coords)
						result += '<tr><td>Radius</td><td>' + coords.accurary + '</td></tr>';
					else if('rangle' in coords)
						result += '<tr><td>Radius</td><td>' + geoMath.rangle2meters(coords.rangle) + '</td></tr>';

					result += '</table>';
					return result;
				}
				var contents = "";

				//if(false)
				contents +=
					sect("GeoMath") +
					head("Test1") + coords(geoMath.nvect2coords(geoMath.coords2nvect({latitude: Math.PI/4, longitude: Math.PI/8}))) +
					head("Test2") + coords(geoMath.placePlus({latitude:0, longitude:0, rangle: 0},{latitude:Math.PI/2, longitude:0, rangle: 0})) +
					head("Test3") + coords(geoMath.placePlus({latitude:0, longitude:0, rangle: 0},{latitude: geoMath.meters2rangle(2000), longitude:0, rangle: 0})) +
					head("Test4") + geoMath.distance({latitude:0, longitude:0},{latitude: geoMath.meters2rangle(2000), longitude:0}) + "<br>Should be 2000." +
					head("Test5") + coords(geoMath.nvect2coords([0,0,1])) +
					head("Test6") + coords(geoMath.nvect2coords([0,0,-1]));

				contents +=
					sect("Position") +
					head("Test") + '<a id="normalPos">normal</a> <a id="errorPos">error</a> <a id="pendingPos">pending</a> <a id="foundPos">found</a> <a id="clearPos">clear</a>';

				app.setMain( contents );
				$('#normalPos').on("click", function() { app.setPosition('Test') });
				$('#errorPos').on("click", function() { app.setPosition('Error', 'error') });
				$('#pendingPos').on("click", function() { app.setPosition('Pending', 'pending') });
				$('#foundPos').on("click", function() { app.setPosition('Found', 'found') });
				$('#clearPos').on("click", function() { app.setPosition() });
			}
		}
	// Currently active tab.
	, activeTab: "Statistics"
	};

