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
			app.initializeGeoLocation();
			app.refreshTabs();
			app.refreshActiveTab();
			app.db = { nextId: 0, places: {} };
		}
	, setPosition: function( inside, style )
		{
			var elem = $('#position');
			if( !inside )
			{
				elem.slideUp( function() { elem.html(''); } );
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
	, handlerOnTabClick: function(n)
		{	return function()
			{
				if( app.activeTab == n )
					return;

				app.activeTab = n;
				app.refreshTabs();
				app.tabs[n].show();
			};
		}
	, refreshActiveTab: function()
		{
			app.tabs[app.activeTab].show();
		}
	, renameActiveTab: function(name)
		{
			app.tabs[app.activeTab].name = name;
			app.refreshTabs();
		}
	, newTab: function(tab,setActive)
		{
			app.tabs.push(tab);
			if(setActive)
				app.activeTab = app.tabs.length-1;
			app.refreshTabs();
			if(setActive)
				app.refreshActiveTab();
		}
	, refreshTabs: function()
		{
			var content = '';
			var shows = { };

			if( app.tabs.length > 1 )
				for( var count = 0; count < app.tabs.length; count += 1 ) {
					var n = count;
					var id = 'tabSwitch_' + n;
					shows[id] = app.handlerOnTabClick(n);

					var evenOdd = n % 2 ? 'Even' : 'Odd';
					var activeTab = n == app.activeTab ? " activeTab" : "";
					content += '<a id="' + id + '" class="tabSwitcher tabSwitcher' + evenOdd + activeTab + '">' + app.tabs[n].name + '</span>';
				}

			$('#tabs').html(content);
			for( var id in shows ) {
				$('#'+id).on("click", shows[id]);
			}
		}
	, setMain: function( inside )
		{
			$('#main').html(inside);
		}
	, tabs:
		[	{ name: "Statistics"
			, show: function()
				{
					var contents = '';
					contents += '<button type="button" id="stNew">New place</button>';

					app.setMain(contents);

					$('#stNew').on("click", function() {
						app.newTab(app.addModifyPlaceTab({}),true);
					});
				}
			}
		,	{ name: "Debug"
			, show: function()
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
						head("Test4") + geoMath.distance({latitude:0, longitude:0, rangle: 0},{latitude: geoMath.meters2rangle(2000), longitude:0, rangle: 0}) + "<br>Should be 2000." +
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
		]
	// Currently active tab.
	, activeTab: 0
	, coordinateTable: function(coords) {
			var result =
				'<tr><td>Latitude</td><td>' + geoMath.rad2deg(coords.latitude) + '</td></tr>' +
				'<tr><td>Longitude</td><td>' + geoMath.rad2deg(coords.longitude) + '</td></tr>';

			if('accuracy' in coords)
				result += '<tr><td>Radius</td><td>' + coords.accurary + '</td></tr>';
			else if('rangle' in coords)
				result += '<tr><td>Radius</td><td>' + geoMath.rangle2meters(coords.rangle) + '</td></tr>';

			return result;
		}
	, addModifyPlaceTab: function(place)
		{
			return { name: place.name, show: function()
				{
					var contents = '<table>';

					contents += '<tr><td>Name</td><td><input type="text" id="amptName"></td></tr>';
					if( place.area )
						contents += app.coordinateTable(place.area);
					contents += '</table>';
					contents += '<button type="button" id="amptExpand">Expand Area</button>';

					app.setMain(contents);

					$('#amptName').on("input", function() {
					  	var name = $('#amptName').val();
						if(! place.id )
						{
							place.id = app.db.nextId;
							app.db.nextId += 1;
							app.db.places[place.id] = place;
						}
						place.name = name;
						app.renameActiveTab(name);
					});
					$('#amptExpand').on("click", function() {
						if( app.currentArea )
						{
							if( place.area )
								place.area = geoMath.placePlus(place.area,app.currentArea);
							else
								place.area = geoMath.currentArea;
							app.refreshActiveTab();
						}
						else
							alert("No location information currently available!");
					});
				}
			};
		}
	, initializeGeoLocation: function()
		{
			var locationOptions = {
				enableHighAccuracy: true,
				maximumAge		  : 30000,
				timeout			  : 27000
			};
			if(navigator.geolocation)
				locationWatcher = navigator.geolocation.watchPosition(app.locationSuccess, app.locationError, locationOptions);
			else
				app.setPosition('Browser not supported','error');
		}
	, locationSuccess: function(coords)
		{
			app.currentArea = geoMath.placePoint(coords);
			if(app.db.places[app.minDistance()])
				app.setPosition(app.db.places[app.minDistance()],'found');
			else
				app.setPosition('Position aquired','found');
		}
	, locationError: function(error)
		{
			switch(error.code){
				case error.PERMISSION_DENIED:
					app.setPosition('Permission denied','error');
					break;
				case error.POSITION_UNAVAILABLE:
					app.setPosition('Position not available','error');
					break;
				case error.TIMEOUT:
					app.setPosition('Request timed out','error');
					break;
				case error.UNKNOWN_ERROR:
					app.setPosition('Unknown error','error');
					break;
				}
		}
	, minDistance: function()
		{
			var i = 0;
			var min;
			for(i = 0; i == (app.db.nextId-1); i++)
			{
				if(geoMath.distance(app.db.places[i+1]) > geoMath.distance(app.db.places[i]))
					min = geoMath.distance(app.db.places[i]);
			}
			alert('out of for');
		}
	};

