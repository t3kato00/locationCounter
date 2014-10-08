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
			app.loadDatabase();
			app.refreshTabs();
			app.refreshActiveTab();
			app.initializeGeoLocation();
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
				var activeTab = app.tabs[app.activeTab];
				if( app.activeTab == n )
					return;	
				else if( activeTab.trans )
				{
					for(var i = app.activeTab; i < app.tabs.length-1; i += 1)
						app.tabs[i] = app.tabs[i+1];
					app.tabs.pop();
					if( n > app.activeTab )
						n -= 1;
				}
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
	, closeTab: function()
		{
			for(var i = app.activeTab; i < app.tabs.length-1; i += 1)
				app.tabs[i] = app.tabs[i+1];
				
			app.tabs.pop();
			app.activeTab = 0;
			app.refreshTabs();
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
					var n = 0;
					for( var placeId in app.db.places )
					{
						var evenOdd = n % 2 ? 'stOdd' : 'stEven';
						var place = app.db.places[placeId];
						contents += '<div class="placeItem ' + evenOdd + '"><span class="placeName">' + (place.name || 'Unnamed') + '</span><a id="statEdit' + placeId + '" class="statEdit">Edit</a></div>';
						n += 1;
					}
					contents += '<div id="stNew" class="button">New Place</div>';
					contents += '<div id="stReset" class="button">Reset Database</div>';

					app.setMain(contents);
					for( var placeId in app.db.places )
					{
						var place = app.db.places[placeId];
						$('#statEdit' + placeId).on("click", function() {
							app.newTab(app.addModifyPlaceTab(place),true);
						});
					}
					
					$('#stNew').on("click", function() {
						app.newTab(app.addModifyPlaceTab({}),true);
					});
					
					$('#stReset').on("click", function() {
						app.newDatabase();
						app.saveDatabase();
						app.refreshActiveTab();
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
			if(!place.name)
				place.name = '';
			return { name: place.name, trans: true, show: function()
				{
					var contents = '<table>';

					contents += '<tr><td>Name</td><td><input type="text" id="amptName" value="' + place.name + '" ></td></tr>';
					if( place.area )
						contents += app.coordinateTable(place.area);
					contents += '</table>';
					contents += '<div id="amptExpand" class="button">Include current position</div>'
					contents += '<div id="amptDelete" class="button">Delete Place</div>';
					
					app.setMain(contents);

					$('#amptName').on("input", function() {
					  	var name = $('#amptName').val();
						place.name = name;
						if(! place.hasOwnProperty('id') && name !== '')
						{
							place.id = app.db.nextId;
							app.db.nextId += 1;
							app.db.places[place.id] = place;
							app.saveDatabase();
						}
						else if(place.hasOwnProperty('id') && name === '')
						{
							delete app.db.places[place.id];
							delete place.id;
							app.saveDatabase();
						}
						app.renameActiveTab(name || 'Unnamed');
					});
					$('#amptExpand').on("click", function() {
						if( app.currentArea )
						{
							if( place.area )
								place.area = geoMath.placePlus(place.area,app.currentArea);
							else
								place.area = app.currentArea;
							app.refreshActiveTab();
						}
						else
							alert("No location information currently available!");
					});
					$('#amptDelete').on("click", function() {
						if(place.hasOwnProperty('id'))
						{
							delete app.db.places[place.id];
							delete place.id;
							app.saveDatabase();
						}
						app.closeTab();
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
			app.currentArea = geoMath.placePoint(coords.coords);
			app.updatePosition();
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
	, updatePosition: function()
		{
			var minDistance = null;
			var minPlace;
			for( var placeId in app.db.places )
			{
				var place = app.db.places[placeId];
				if(!place.area)
					continue;
				var currentDistance = geoMath.distance(app.currentArea,place.area);
				if(currentDistance === null || currentDistance < minDistance)
				{
					minDistance = currentDistance;
					minPlace = place;
				}
			}
			if(minDistance < 0)
				app.setPosition(place.name || 'Unnamed','found');
			else
				app.setPosition();
		}
	, saveDatabase: function()
		{
			if( typeof(Storage) === "undefined" )
				return;
			var st = window.localStorage;
			st.setItem('Location Database', JSON.stringify( app.db ));
		}
	, loadDatabase: function()
		{
			if( typeof(Storage) === "undefined" )
			{
				alert('Local storage not supported');
				app.newDatabase();
				return;
			}
			var db = localStorage.getItem('Location Database');
			if( !db )
			{
				app.newDatabase();
				return;
			}
			try 
			{
				db = JSON.parse( db );
			}
			catch(err)
			{
				alert('Corrupted Database ' + err.message);
				app.newDatabase();
			}
			app.db = db;
		}
	, newDatabase: function()
		{
			app.db = { nextId: 0, places: {} };
		}
	};

