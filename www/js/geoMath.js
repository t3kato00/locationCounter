var geoMath =
	{ earthRadius = 6371000;
	, deg2rad(deg): function()
		{
			return deg * (Math.PI/180);
		}
	, meters2rangle: function (meters)
		{
			return meters/earthRadius;
		}
	, distance: function (coordsA, coordsB)
	 	{
			var dLat = deg2rad(coordsA.latitude-coordsB.latitude);
			var dLon = deg2rad(coordsA.longitude-coordsB.longitude);
			var a =
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(coordsB.latitude)) * Math.cos(deg2rad(coordsA.latitude)) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = earthRadius * c;
			return d;
		}
	, placeRangle(coord, rangle)
		{
			return { latitude: coord.latitude, longitude: coord.longitude, rangle: rangle };
		}
	, placePoint(coord)
		{
			return { latitude: coord.latitude, longitude: coord.longitude, rangle: meters2rangle(coord.accuracy) };
		}
	, placeAdd(place, coord)
		{
			var best = null;
			var candidate = function(lat,lon) {
				var current = { lat: lat - place.latitude, lon: lon - place.longitude }
				current.len2 = current.lat*current.lat + current.lon*current.lon;

				if( best === null )
					best = current;
				else if( current.len2 < best.len2 )
					best = current;
			}
			var candidate2 = function(lat,lon) {
				candidate(lat,lon);

				if(place.longitude < 0)
					lon -= 2*Math.PI;
				else
					lon += 2*Math.PI;

				candidate(lat,lon);
			}

			// Calculate the flipped coordinate.
			var altCoord = {};
			if( coord.latitude < 0 )
				altCoord.latitude = -Math.PI - coord.latitude;
			else
				altCoord.latitude = Math.PI - coord.latitude;
			if( coord.longitude < 0 )
				altCoord.longitude = coord.longitude + Math.PI;
			else
				altCoord.longitude = coord.longitude - Math.PI;

			// Calculate shortest anglevector to coordinate alternates.
			candidate2(coord.latitude, coord.longitude);
			candidate2(altCoord.latitude, altCoord.longitude);

			var distRangle = Math.sqrt(best.len2);
			var accRangle = meters2rangle(coord.accuracy)
			// Handle cases where one of the areas contains the other.
			if( accRangle + distRangle < place.rangle )
				return place;
			else if( place.rangle + distRangle < accRangle )
				return { latitude: best.lat, longitude: best.lon, rangle: accRangle };

			// Calculate the new place (middle point and rangle).
			var k = 0.5 * (-place.rangle + distRangle + accRangle) / (place.rangle + distRangle + accRangle);
			var unit = { lat: best.lat/best.len, lon: best.lon/best.len };
			var result = { latitude: place.latitude + k*unit.lat, longitude: place.longitude + k*unit.lon, 0.5*(place.rangle+dist.Rangle+accRangle) };

			// And normalize it.
			if( result.latitude > 0.5*Math.PI )
			{
				result.latitude = Math.PI - result.latitude;
				if( result.longitude < 0 )
					result.longitude = result.longitude + Math.PI;
				else
					result.longitude = result.longitude - Math.PI;
			}
			else if( result.latitude < -0.5*Math.PI )
			{
				result.latitude = -Math.PI - result.latitude;
				if( result.longitude < 0 )
					result.longitude = result.longitude + Math.PI;
				else
					result.longitude = result.longitude - Math.PI;
			} else if( result.longitude < -Math.PI )
				result.longitude += 2*Math.PI;
			else if( result.longitude > Math.PI )
				result.longitude -= 2*Math.PI;

			return result;
		}
	}

