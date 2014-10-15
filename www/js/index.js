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
				app.setFooter();
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
			if(! inside )
				inside = '';
			$('#main').html(inside);
		}
	, setFooter: function( inside )
		{
			if(! inside )
				inside = '';
			$('#footer').html(inside);
		}
	, tabs:
		[	{ name: "Info"
			, show: function()
				{
					contents += '<table class="propertyTable">';
					var contents = '';
					if( app.currentArea )
					{
						contents += '<tr><th colspan="2" class="center">Phone coordinates</th><tr>'
						contents += app.coordinateTable(app.currentArea);
					}
					if( app.currentPlace )
					{
						contents += '<tr><th colspan="2" class="center">Current place</th><tr>'
						contents += '<tr><td colspan="2" class="center">' + app.currentPlace.name + '</th><tr>'
						contents += app.coordinateTable(app.currentPlace.area);
						contents += '<tr><td class="property">Time</td><td>' + app.showTime(app.currentPlace.time) + '</td></tr>';
					}
					contents += '</table>';

					app.setMain(contents);
					app.setFooter();
				}
			}
		,	{ name: "Statistics"
			, show: function()
				{
					var contents = '';
					var n = 0;
					for( var placeId in app.db.places )
					{
						var evenOdd = n % 2 ? 'stOdd' : 'stEven';
						var place = app.db.places[placeId];
						contents += '<div class="placeItem ' + evenOdd + '"><span class="placeName">' + place.name + '</span><span class="placeTime">' + app.showTime(place.time) + '</span><a id="statEdit' + placeId + '" class="statEdit">Edit</a></div>';
						n += 1;
					}

					app.setMain(contents);

					contents = '';
					contents += '<div id="stNew" class="button">New Place</div>';
					contents += '<div id="stReset" class="button">Reset Database</div>';
					app.setFooter(contents);

					function handler(placeId) {
						$('#statEdit' + placeId).on("click", function() {
							app.newTab(app.addModifyPlaceTab(app.db.places[placeId]),true);
						});
					}
					for( var placeId in app.db.places )
						handler(placeId);
					
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
		]
	// Currently active tab.
	, activeTab: 0
	, coordinateTable: function(coords) {
			var result =
				'<tr><td class="property">Latitude</td><td>' + geoMath.rad2deg(coords.latitude) + '</td></tr>' +
				'<tr><td class="property">Longitude</td><td>' + geoMath.rad2deg(coords.longitude) + '</td></tr>';

			if('accuracy' in coords)
				result += '<tr><td class="property">Radius</td><td>' + coords.accurary + '</td></tr>';
			else if('rangle' in coords)
				result += '<tr><td class="property">Radius</td><td>' + geoMath.rangle2meters(coords.rangle) + '</td></tr>';

			return result;
		}
	, addModifyPlaceTab: function(place)
		{
			if(!place.hasOwnProperty('name'))
				place.name = '';
			if(!place.hasOwnProperty('time'))
				place.time = 0;
			return { name: place.name, trans: true, show: function()
				{
					var contents = '<table class="propertyTable">';

					contents += '<tr><td class="property">Name</td><td><input type="text" id="amptName" value="' + place.name + '" ></td></tr>';
					if( place.hasOwnProperty('area') )
						contents += app.coordinateTable(place.area);
					contents += '<tr><td class="property">Time</td><td>' + app.showTime(place.time) + '</td></tr>';
					contents += '</table>';
					
					app.setMain(contents);

					contents = '';
					contents += '<div id="amptExpand" class="button">Include current position</div>'
					contents += '<div id="amptDelete" class="button">Delete Place</div>';

					app.setFooter(contents);

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
							app.saveDatabase();
							app.refreshActiveTab();
						}
						else
							alert("No location information currently available!");
					});
					$('#amptDelete').on("click", function() {
						if(app.currentPlace == place)
						{
							delete app.currentPlace;
							app.updatePosition(new Date().getTime());
						}
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
			delete app.locationError;
			//app.updatePosition(coords.timestamp);
			app.updatePosition(new Date().getTime());
		}
	, locationError: function(error)
		{
			delete app.currentArea;

			switch(error.code){
				case error.PERMISSION_DENIED:
					app.locationError = 'Permission denied';
					break;
				case error.POSITION_UNAVAILABLE:
					app.locationError = 'Position not available';
					break;
				case error.TIMEOUT:
					app.locationError = 'Request timed out';
					break;
				case error.UNKNOWN_ERROR:
					app.locationError = 'Unknown error';
					break;
				}
			app.updatePosition(new Date().getTime());
		}
	, updatePosition: function(newTime)
		{
			var oldTime;
			if( app.hasOwnProperty('oldPositionTime') )
				oldTime = app.oldPositionTime;
			else
				oldTime = newTime;

			if( app.hasOwnProperty('currentPlace') )
			{
				app.currentPlace.time += newTime - oldTime;
				app.saveDatabase();
			}

			if(!app.hasOwnProperty('currentArea'))
			{
				delete app.currentPlace;
				delete app.oldPositionTime;
				app.setPosition(app.locationError,'error');
				return;
			}

			var minDistance = null;
			var minPlace;
			for( var placeId in app.db.places )
			{
				var place = app.db.places[placeId];
				if(!place.hasOwnProperty('area'))
					continue;
				var currentDistance = geoMath.distance(app.currentArea,place.area);
				//alert('Place: ' + place.name + ' ' + currentDistance);
				if(currentDistance < minDistance)
				{
					//alert('Selected!');
					minDistance = currentDistance;
					minPlace = place;
				}
			}
			if(minDistance < 0)
			{
				app.currentPlace = minPlace;
				app.oldPositionTime = newTime;
				app.setPosition(minPlace.name || 'Unnamed','found');
			}
			else
			{
				delete app.currentPlace;
				app.setPosition();
			}
			if(app.activeTab == 0)
				app.refreshActiveTab();
		}
	, showTime: function(time)
		{
			time = Math.floor(time);
			var second = 1000;
			var minute = 60*second;
			var hour = 60*minute;
			var day = 24*hour;

			var days = Math.floor(time / day);
			time = time % day;
			var hours = Math.floor(time / hour);
			time = time % hour;
			var minutes = Math.floor(time / minute);
			time = time % minute;
			var seconds = Math.floor(time / second);

			var result = '';
			if( days )
			{
				result += days + 'd';
				if( hours || minutes )
					result += ' ';
			}
			if( hours )
			{
				result += hours + 'h';
				if( minutes )
					result += ' ';
			}
			if( minutes )
				result += minutes + 'min';
			if( !days && !hours && !minutes )
				result += seconds + 's';
			return result;
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

