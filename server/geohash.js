// Geohash encoding for server-side use
// Same algorithm as the Cloudflare version and client-side geohash.js

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function encode(lat, lon, precision = 7) {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      const lonMid = (lonMin + lonMax) / 2;
      if (lon > lonMid) {
        idx |= (1 << (4 - bit));
        lonMin = lonMid;
      } else {
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat > latMid) {
        idx |= (1 << (4 - bit));
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

function bounds(hash) {
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;
  let evenBit = true;

  for (const c of hash) {
    const idx = BASE32.indexOf(c);
    for (let bit = 4; bit >= 0; bit--) {
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2;
        if (idx & (1 << bit)) {
          lonMin = lonMid;
        } else {
          lonMax = lonMid;
        }
      } else {
        const latMid = (latMin + latMax) / 2;
        if (idx & (1 << bit)) {
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }
      evenBit = !evenBit;
    }
  }

  return {
    sw: { lat: latMin, lon: lonMin },
    ne: { lat: latMax, lon: lonMax }
  };
}

function center(hash) {
  const b = bounds(hash);
  return {
    lat: (b.sw.lat + b.ne.lat) / 2,
    lon: (b.sw.lon + b.ne.lon) / 2
  };
}

module.exports = { encode, bounds, center };
