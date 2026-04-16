// Geohash encoder/decoder
const Geohash = {
    base32: '0123456789bcdefghjkmnpqrstuvwxyz',

    encode: function(lat, lon, precision) {
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
                geohash += this.base32[idx];
                bit = 0;
                idx = 0;
            }
        }

        return geohash;
    },

    bounds: function(geohash) {
        let evenBit = true;
        let latMin = -90, latMax = 90;
        let lonMin = -180, lonMax = 180;

        for (let i = 0; i < geohash.length; i++) {
            const chr = geohash[i];
            const idx = this.base32.indexOf(chr);

            for (let n = 4; n >= 0; n--) {
                const bitN = (idx >> n) & 1;
                if (evenBit) {
                    const lonMid = (lonMin + lonMax) / 2;
                    if (bitN === 1) {
                        lonMin = lonMid;
                    } else {
                        lonMax = lonMid;
                    }
                } else {
                    const latMid = (latMin + latMax) / 2;
                    if (bitN === 1) {
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
    },

    // Get center point of a geohash
    center: function(geohash) {
        const b = this.bounds(geohash);
        return {
            lat: (b.sw.lat + b.ne.lat) / 2,
            lon: (b.sw.lon + b.ne.lon) / 2
        };
    }
};
