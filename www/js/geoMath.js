var geoMath =
	{ earthRadius: 6371000.0
	, deg2rad: function(deg)
		{
			return deg * (Math.PI/180);
		}
	, rad2deg: function(rad)
		{
			return rad * (180/Math.PI);
		}
	, meters2rangle: function(meters)
		{
			return meters/this.earthRadius;
		}
	, rangle2meters: function(rangle)
		{
			return rangle*this.earthRadius;
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
			var d = this.earthRadius * c;
			return d;
		}
	, placeRangle: function(coord, rangle)
		{
			return { latitude: coord.latitude, longitude: coord.longitude, rangle: rangle };
		}
	, placePoint: function(coord)
		{
			return { latitude: coord.latitude, longitude: coord.longitude, rangle: this.meters2rangle(coord.accuracy) };
		}
	, placeAdd: function(place, coord)
		{
			var best = null;
			var candidate = function(lat,lon) {
				var current = { lat: lat - place.latitude, lon: lon - place.longitude };
				current.len2 = current.lat*current.lat + current.lon*current.lon;

				if( best === null || current.len2 < best.len2 )
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
			alert("distRangle = " + distRangle);
			var accRangle = this.meters2rangle(coord.accuracy)
			alert("accRangle = " + accRangle);
			alert("place.rangle = " + place.rangle);
			// Handle cases where one of the areas contains the other.
			if( accRangle + distRangle < place.rangle )
				return place;
			else if( place.rangle + distRangle < accRangle )
				return { latitude: best.lat, longitude: best.lon, rangle: accRangle };

			// Calculate the new place (middle point and rangle).
			var k = 0.5 * (-place.rangle + distRangle + accRangle) / (place.rangle + distRangle + accRangle);
			alert("k = " + k);
			var unit = { lat: best.lat/distRangle, lon: best.lon/distRangle };
			var result = { latitude: place.latitude + k*unit.lat, longitude: place.longitude + k*unit.lon, rangle: 0.5*(place.rangle+distRangle+accRangle) };

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

for( var member in geoMath )
{
	if( typeof(geoMath[member]) == 'function' )
		geoMath[member] = geoMath[member].bind(geoMath);
}
alert('geoMath');
