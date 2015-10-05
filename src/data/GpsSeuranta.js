export function getEvents(year, callback) {
    var url = "/gps/events-" + year + ".json";
    $.getJSON(url, function (events) {
        callback(events.events);
    });
}
export  function getEvent(id, callback) {
    var metdataUrl = "/gps/" + id + "/init.txt";
    $.get(metdataUrl, function (metadata) {
        var ev = { id: id };
        var lines = metadata.split("\n");
        for (var i in lines) {
            var keyValue = lines[i].split(":");
            var key = keyValue[0].toLowerCase();
            var value = keyValue[1];

            if (key == "competitor") {
                value = parseCompetitor(value);
            } else if (key == "calibration") {
                value = parseCalibration(value);
            }

            if (!ev[key]) {
                ev[key] = value;
            } else {
                if (!(ev[key].constructor === Array)) {
                    ev[key] = [ev[key]];
                }

                ev[key].push(value);
            }
        }

        callback(ev);
    });
}
export function parseCompetitor(value) {
    var values = value.split("|");
    return {
        id: values[0],
        startDate: values[1],
        startTime: values[2],
        name: values[3],
        short: values[4]
    };
}
export function parseCalibration(value) {
    function point(b, a) {
        this.x = b;
        this.y = a;
    }

    function calibration(b, a) {
        var c, e, d, f, h, g, m, n, p, l, r, q;
        this.KKJLaLo_to_KKJxy = KKJLaLo_to_KKJxy;
        q = b.split("|");
        this.centralmeridian = q[0];
        e = new point(q[0], q[1]);
        g = new point(q[4], q[5]);
        d = new point(q[8], q[9]);
        c = this.KKJLaLo_to_KKJxy(e, this.centralmeridian).x;
        e = this.KKJLaLo_to_KKJxy(e, this.centralmeridian).y;
        h = this.KKJLaLo_to_KKJxy(g, this.centralmeridian).x;
        g = this.KKJLaLo_to_KKJxy(g, this.centralmeridian).y;
        p = this.KKJLaLo_to_KKJxy(d, this.centralmeridian).x;
        l = this.KKJLaLo_to_KKJxy(d, this.centralmeridian).y;
        d = q[2] / a;
        f = -q[3] / a;
        m = q[6] / a;
        n = -q[7] / a;
        r = q[10] / a;
        q = -q[11] / a;
        if (1 > Math.abs(g - l)) {
            var t = h,
                u = m,
                v = g,
                w = n;
            h = c;
            m = d;
            g = e;
            n = f;
            c = t;
            d = u;
            e = v;
            f = w;
        }
        this.a11 = (d * (g - l) - e * (m - r) + m * l - g * r) / (c * (g - l) - e * (h - p) + h * l - g * p);
        this.a12 = -(d * (g - l) - e * (m - r) + m * l - g * r) * (h - p) / ((c * (g - l) - e * (h - p) + h * l - g * p) * (g - l)) + m / (g - l) - r / (g - l);
        this.a13 = (d * (g - l) - e * (m - r) + m * l - g * r) * (h * l - g * p) / ((c * (g - l) - e * (h - p) + h * l - g * p) * (g - l)) - m * l / (g - l) + g * r / (g - l);
        this.a21 = -(e * (n - q) - f * (g - l) + g * q - n * l) / (c * (g - l) - e * (h - p) + h * l - g * p);
        this.a22 = (e * (n - q) - f * (g - l) + g * q - n * l) * (h - p) / ((c * (g - l) - e * (h - p) + h * l - g * p) * (g - l)) + (n - q) / (g - l);
        this.a23 = -(e * (n - q) - f * (g - l) + g * q - n * l) * (h * l - g * p) / ((c * (g - l) - e * (h - p) + h * l - g * p) * (g - l)) - (n - q) * l / (g - l) + q;
        this.calibrated = !0;
        this.getmapx = getmapx;
        this.getmapy = getmapy;
    }

    function getmapx(b, a) {
        if (!this.calibrated) return 0;
        var c = this.KKJLaLo_to_KKJxy(new point(b, a), this.centralmeridian).x,
            e = this.KKJLaLo_to_KKJxy(new point(b, a), this.centralmeridian).y;
        return this.a11 * c + this.a12 * e + this.a13;
    }

    function getmapy(b, a) {
        if (!this.calibrated) return 0;
        var c = this.KKJLaLo_to_KKJxy(new point(b, a), this.centralmeridian).x,
            e = this.KKJLaLo_to_KKJxy(new point(b, a), this.centralmeridian).y;
        return -(this.a21 * c + this.a22 * e + this.a23);
    }

    function KKJLaLo_to_KKJxy(b, a) {
        var c = (b.x - a) * Math.PI / 180,
            e = 6378137 * (1 - 1 / 298.257223563),
            d = e * e,
            f = 6378137 / e * 6378137,
            h = (40680631590769 - d) / d,
            e = (6378137 - e) / (6378137 + e),
            d = e * e,
            g = Math.cos(b.y * Math.PI / 180),
            g = h * g * g,
            g = Math.atan(Math.tan(b.y * Math.PI / 180) / Math.cos(c * Math.sqrt(1 + g))),
            m = Math.cos(g),
            c = Math.tan(c) * m / Math.sqrt(1 + h * m * m),
            n = 6378137 / (1 + e),
            h = n * (1 + d / 4 + d * d / 64),
            m = 1.5 * n * e * (1 - d / 8),
            p = .9375 * n * d * (1 - d / 4),
            e = 35 * n / 48 * d * e,
            d = new point(0, 0);
        d.y = h * g - m * Math.sin(2 * g) + p * Math.sin(4 * g) - e * Math.sin(6 * g);
        d.x = f * Math.log(c + Math.sqrt(1 + c * c)) + 15E5;
        return d;
    };

    return new calibration(value, 1);
}
export function getPoints(ev, offset, callback) {
    $.get("/gps/" + ev.id + "/data.php?offset=0&reset=-1", function (data) {
        var trackpoints = parseTrackpoints(data, ev.calibration);

        callback(_.groupBy(trackpoints, function (i) {
            return i.competitorId;
        }));
    });
}
export function parseTrackpoints(data, calibration) {
    var trackpoints = [];

    var lines = data.split("\n");
    for (var i in lines) {
        var line = lines[i];
        var values = line.split(".");
        if (values.length >= 2 && values[1].indexOf("*") <= -1) {
            var initialValueParts = values[1].split("_"),
                competitorId = values[0],
                wgsx = initialValueParts[1] / 50000,
                wgsy = initialValueParts[2] / 100000,
                time = initialValueParts[0] / 1,
                battery = -100;

            if (initialValueParts.length > 3) {
                for (i = 3; i < initialValueParts.length; i++) {
                    if ("B" == initialValueParts[i].substring(0, 1)) {
                        battery = initialValueParts[i].substring(1);
                        break;
                    }
                }
            }

            var mapx = calibration.getmapx(wgsx, wgsy),
                mapy = calibration.getmapy(wgsx, wgsy);

            trackpoints.push({ time: time, wgsx: wgsx, wgsy: wgsy, mapx: mapx, mapy: mapy, battery: battery, competitorId: competitorId });

            for (i = 2; i < values.length && values[i].length >= 3; i++) {
                var parts = values[i].split("_");
                if (parts.length < 3) {
                    time = time + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(values[i].substring(0, 1)) - 31;
                    wgsx = (50000 * wgsx + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(values[i].substring(1, 2)) - 31) / 50000;
                    wgsy = (100000 * wgsy + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(values[i].substring(2, 3)) - 31) / 100000;
                } else {
                    time += parts[0] / 1;
                    wgsx += parts[1] / 50000;
                    wgsy += parts[2] / 100000;
                }

                mapx = calibration.getmapx(wgsx, wgsy);
                mapy = calibration.getmapy(wgsx, wgsy);

                trackpoints.push({ time: time, wgsx: wgsx, wgsy: wgsy, mapx: mapx, mapy: mapy, battery: -100, competitorId: competitorId });
            }
        }
    }

    return trackpoints;
}
