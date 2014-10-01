var geoMath =
	{ deg2rad(deg): function()
		{
			return deg * (Math.PI/180);
		}
	, calculateDistance: function (coordsA, coordsB)
	 	{
			var dLat = deg2rad(coordsA.latitude-coordsB.latitude);
			var dLon = deg2rad(coordsA.longitude-coordsB.longitude);
			var a =
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(deg2rad(coordsB.latitude)) * Math.cos(deg2rad(coordsA.latitude)) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = 6371000 * c;
			return d;
		}
	}

