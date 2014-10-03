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
	, coords2nvect: function(coords)
		{
			return [Math.cos(coords.latitude)*Math.cos(coords.longitude), Math.cos(coords.latitude)*Math.sin(coords.longitude), Math.sin(coords.latitude)];
		}
	, nvect2coords: function(nv)
		{
			if(nv[0] == 0 && nv[1] == 0)
				return { latitude: Math.atan2(nv[2],0), longitude: 0 };
			else
				return { latitude: Math.atan2(nv[2],Math.sqrt(nv[0]*nv[0] + nv[1]*nv[1])), longitude: Math.atan2(nv[1], nv[0]) };
		}
	, nvectsRangle: function(nva,nvb)
		{
			var q = [nva[1]*nvb[2]-nva[2]*nvb[1], nva[2]*nvb[0]-nva[0]*nvb[2], nva[0]*nvb[1]-nva[1]*nvb[0]]
			return Math.atan2( Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2]), nva[0]*nvb[0] + nva[1]*nvb[1] + nva[2]*nvb[2]);
		}
	, distance: function (coordsA, coordsB)
		{
			return this.rangle2meters(this.nvectsRangle(this.coords2nvect(coordsA),this.coords2nvect(coordsB)));
		}
	 	/*{
			// This seemed to give incorrect results.
			var dLat = this.deg2rad(coordsA.latitude-coordsB.latitude);
			var dLon = this.deg2rad(coordsA.longitude-coordsB.longitude);
			var a =
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(this.deg2rad(coordsB.latitude)) * Math.cos(this.deg2rad(coordsA.latitude)) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = this.earthRadius * c;
			return d;
		}*/
	, placeRangle: function(coord, rangle)
		{
			return { latitude: coord.latitude, longitude: coord.longitude, rangle: rangle };
		}
	, placePoint: function(coord)
		{
			var result = { latitude: coord.latitude, longitude: coord.longitude, rangle: 0 };
			if('accuracy' in coord)
				result.rangle = this.meters2rangle(coord.accuracy);
			return result;
		}
	, nvectsRangle: function(nva,nvb)
		{
			var q = [nva[1]*nvb[2]-nva[2]*nvb[1], nva[2]*nvb[0]-nva[0]*nvb[2], nva[0]*nvb[1]-nva[1]*nvb[0]]
			return Math.atan2( Math.sqrt(q[0]*q[0] + q[1]*q[1] + q[2]*q[2]), nva[0]*nvb[0] + nva[1]*nvb[1] + nva[2]*nvb[2]);
		}
	, placePlus: function(a, b)
		{
			var nva = this.coords2nvect(a);
			var nvb = this.coords2nvect(b);

			var distRangle = this.nvectsRangle(nva,nvb);

			if( a.rangle + distRangle < b.rangle )
				return b; // b contains a.
			if( b.rangle + distRangle < a.rangle )
				return a; // a contains b.

			var nvc = [nva[0]+nvb[0],nva[1]+nvb[1],nva[2]+nvb[2]];
			if( nvc[0] == 0 && nvc[1] == 0 && nvc[2] == 0)
				return { latitude: 0, longitude: 0, rangle: Math.PI }; // We have selected two points on the opposite sides of earth and thus the whole globe.
			var k = 1 / Math.sqrt(nvc[0]*nvc[0]+nvc[1]*nvc[1]+nvc[2]*nvc[2]);
			nvc[0] *= k;
			nvc[1] *= k;
			nvc[2] *= k;

			var result = this.nvect2coords(nvc);
			result.rangle = 0.5*(a.rangle + distRangle + b.rangle);
			return result;
		}
	}

