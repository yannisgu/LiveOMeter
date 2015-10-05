"use strict";

(function ($) {

    var GpsSeuranta = {
        getEvents: function getEvents(year, callback) {
            var url = "/gps/events-" + year + ".json";
            $.getJSON(url, function (events) {
                callback(events.events);
            });
        },
        getEvent: function getEvent(id, callback) {
            var metdataUrl = "/gps/" + id + "/init.txt";
            $.get(metdataUrl, function (metadata) {
                var ev = { id: id };
                var lines = metadata.split("\n");
                for (var i in lines) {
                    var keyValue = lines[i].split(":");
                    var key = keyValue[0].toLowerCase();
                    var value = keyValue[1];

                    if (key == "competitor") {
                        value = GpsSeuranta.parseCompetitor(value);
                    } else if (key == "calibration") {
                        value = GpsSeuranta.parseCalibration(value);
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
        },
        parseCompetitor: function parseCompetitor(value) {
            var values = value.split("|");
            return {
                id: values[0],
                startDate: values[1],
                startTime: values[2],
                name: values[3],
                short: values[4]
            };
        },
        parseCalibration: function parseCalibration(value) {
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
        },
        getPoints: function getPoints(ev, offset, callback) {
            $.get("/gps/" + ev.id + "/data.php?offset=0&reset=-1", function (data) {
                var trackpoints = GpsSeuranta.parseTrackpoints(data, ev.calibration);

                callback(_.groupBy(trackpoints, function (i) {
                    return i.competitorId;
                }));
            });
        },
        parseTrackpoints: function parseTrackpoints(data, calibration) {
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
    };

    var Canvas = {
        draw: function draw(_event, competitors) {
            window.currentEventId = _event.id;

            var canvas = document.getElementById('canvas');
            paper.setup(canvas);
            paper.project.activeLayer.removeChildren();

            var imageId = "map" + Math.floor(Math.random() * 1000000);
            var img = $("<img />");
            img.attr("src", "/gps/" + _event.id + "/map");
            img.attr("id", imageId);
            img.hide();

            img.load(function () {
                paper.view.viewSize.width = $(window).width() / 2 - 10;
                paper.view.viewSize.height = window.innerHeight;

                $(window).resize(function () {
                    paper.view.viewSize.width = $(window).width() / 2 - 1;
                    paper.view.viewSize.height = window.innerHeight;
                });

                var raster = new paper.Raster(imageId);
                raster.position = new paper.Point(img.width() / 2, img.height() / 2);

                for (var competitor in competitors) {
                    var trackpoints = competitors[competitor];
                    var path = new paper.Path();
                    // Give the stroke a color
                    path.strokeColor = 'black';
                    for (var i = 0; i < trackpoints.length; i++) {
                        var trackpoint = trackpoints[i];
                        path.add(new paper.Point(trackpoint.mapx, trackpoint.mapy));
                    }
                }

                Canvas.updateCourseDrawing();;
            });

            $("body").append(img);

            var dragged = false;
            var tool = new paper.Tool();
            window.last = null;
            tool.onMouseDown = function (event) {
                if(event.event.touches) {
                    last = new paper.Point(event.event.touches[0].clientX / paper.view.zoom, event.event.touches[0].clientY / paper.view.zoom);
                }
                else {
                    last = new paper.Point(event.event.clientX / paper.view.zoom, event.event.clientY / paper.view.zoom);
                }
            };

            tool.onMouseDrag = function (event) {
                var point;
                if(event.event.touches) {
                    point = new paper.Point(event.event.touches[0].clientX / paper.view.zoom, event.event.touches[0].clientY / paper.view.zoom);
                }
                else {
                    point = new paper.Point(event.event.clientX / paper.view.zoom, event.event.clientY / paper.view.zoom);
                }

                paper.view.center = paper.view.center.subtract(point).add(last);
                last = point;

                dragged = true;
            };

            tool.onMouseUp = function (event) {
                if (drawCourseEnabled && !dragged) {
                    currentCourse.push(event.point);
                    Canvas.updateCourseDrawing();
                    DataService.notifyCourseChanged(currentCourse);
                }

                dragged = false;
            };
            
            $(canvas).on('mousewheel', function (event) {
                var delta = event.deltaY;
                var oldZoom = paper.view.zoom;
                var factor = 1.05;
                if (delta > 0) {
                    paper.view.zoom = oldZoom * factor;
                }
                if (delta < 0) {
                    paper.view.zoom = oldZoom / factor;
                }
            });

            Canvas.updateCourseDrawing();
            paper.view.draw();
        },
        currentControl: null,
        drawControl: function(controlFrom, controlTo, trackpoints, color) {
            var path = new paper.Path();
            // Give the stroke a color
            path.strokeColor = color;
            path.strokeWidth = 5;
            for (var i = 0; i < trackpoints.length; i++) {
                var trackpoint = trackpoints[i];

                if((!controlFrom || controlFrom.time <= trackpoint.time) && controlTo.time >= trackpoint.time) {
                    path.add(new paper.Point(trackpoint.mapx, trackpoint.mapy));
                }
            }

            paper.view.draw();
            return path;
        },
        comparasionControls: [],
        drawComparasion: function(leg1, leg2) {
            for(var control in Canvas.comparasionControls) {
                Canvas.comparasionControls[control].remove();
            }

            Canvas.comparasionControls = [Canvas.drawControl(leg1.controlFrom, leg1.controlTo, leg1.trackpoints, 'red'), Canvas.drawControl(leg2.controlFrom, leg2.controlTo, leg2.trackpoints, 'green')]
        },
        _courseObjects: [],

        updateCourseDrawing: function updateCourseDrawing() {
            _.each(Canvas._courseObjects, function (i) {
                i.remove();
            });

            _.each(currentCourse, function (courseItem, key) {

                if (key == 0) {
                    var paperItem = new paper.Path.RegularPolygon(courseItem, 3, 20);
                    paperItem.strokeColor = '#800080';
                    paperItem.strokeWidth = 3;
                    Canvas._courseObjects.push(paperItem);
                } else if (key == currentCourse.length - 1) {
                    var paperItem = new paper.Path.Circle(courseItem, 20);
                    paperItem.strokeColor = '#800080';
                    paperItem.strokeWidth = 3;
                    Canvas._courseObjects.push(paperItem);

                    paperItem = new paper.Path.Circle(courseItem, 25);
                    paperItem.strokeColor = '#800080';
                    paperItem.strokeWidth = 3;
                    Canvas._courseObjects.push(paperItem);
                } else {
                    var paperItem = new paper.Path.Circle(courseItem, 20);
                    paperItem.strokeColor = '#800080';
                    paperItem.strokeWidth = 3;
                    Canvas._courseObjects.push(paperItem);
                }

                if (key != 0) {
                    var lastItem = currentCourse[key - 1];
                    var paperItem = new paper.Path.Line(lastItem, courseItem);
                    paperItem.strokeColor = '#800080';
                    paperItem.strokeWidth = 3;
                    Canvas._courseObjects.push(paperItem);
                }
            });
        }
    };

    function _getResults(data, ev, course) {
        return _.map(data, function (points, key) {
            var competitor = _.findWhere(ev.competitor, { "id": key });
            if (!competitor) {
                return;
            }

            var hours = competitor.startTime.substring(0, 2);
            var minutes = competitor.startTime.substring(2, 4);
            var seconds = competitor.startTime.substring(4, 6);
            var startTime = hours * 60 * 60 + minutes * 60 + seconds * 1 - ev.timezone * 60;

            var controls = [];

            for (var i = 1; i < course.length; i++) {
                var control = course[i];
                var possiblePoints = _.filter(points, function(point) {
                    return point.mapx > control.x - 15 && point.mapx < control.x + 15 && point.mapy > control.y - 15 && point.mapy < control.y + 15;
               })
                var tuples = _.map(possiblePoints, function(val) {
                    var diff = control.subtract(new paper.Point(val.mapx, val.mapy)).length;
                    return [val, Math.abs(diff)];
               });
              var matchingPoint =  _.reduce(tuples, function(memo, val) {
                   return (memo[1] < val[1]) ? memo : val;
               }, [-1, 999])[0];


                /*var matchingPoint = _.find(points, function (point) {
                    return point.mapx > control.x - 15 && point.mapx < control.x + 15 && point.mapy > control.y - 15 && point.mapy < control.y + 15;
                });*/
                var index = _.indexOf(points, matchingPoint);
                points = _.slice(points, index + 1);
                if (!matchingPoint) {
                    matchingPoint = {};
                }

                var j = i - 1;
                var last = null;
                var isValid = false;
                while (j > 0 && !last) {
                    if (controls[j - 1].time) {
                        last = controls[j - 1].time;
                        isValid = j == i - 1;
                    }
                    j--;
                }

                if (!last) {
                    var dayDiff = Math.floor(matchingPoint.time / 86400) * 86400;
                    last = startTime + dayDiff;
                    isValid = i == 1;
                }

                controls.push({ time: matchingPoint.time, diff: matchingPoint.time - last, isValid: isValid, total: matchingPoint.time - startTime });
            }
            return { competitor: competitor, controls: controls, startTime: startTime };
        }).filter(function (runner) {
            return !!runner;
        });
    }

    function calculateErrors(results) {
        var controlTimes = _.reduce(results, function (total, r) {
            for (var i = 0; i < r.controls.length; i++) {
                var control = r.controls[i];
                if (control.isValid) {
                    if (!total[i]) {
                        total[i] = [];
                    }
                    total[i].push(control.diff);
                }
            }
            return total;
        }, []);

        var topAverages = [];
        _.each(controlTimes, function (controlTime, key) {
            if (controlTime) {
                topAverages[key] = _.chain(controlTime).sortBy().take(controlTime.length / 4).sum() / (controlTime.length / 4);
            }
        });

        _.each(results, function (result) {
            _.each(result.controls, function (control, number) {
                if (control.isValid) {
                    control.performanceIndice = control.diff / topAverages[number];
                }
            });
            var performanceIndices = _.filter(_.map(result.controls, "performanceIndice"), function (p) {
                return !!p;
            });

            var middle = (performanceIndices.length + 1) / 2;
            var sorted = _.sortBy(performanceIndices);
            var normalIndice = sorted.length % 2 ? sorted[middle - 1] : (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2;

            _.each(result.controls, function (control, number) {
                if (control.isValid) {
                    control.isError = control.performanceIndice - normalIndice > 0.1;
                }
            });
        });
    }

    function sortResults(results) {
        function compare(res1, res2) {
            var res1Last = res1.controls.length - 1;
            var res2Last = res2.controls.length - 1;
            for (var i = res1Last; i >= 0; i--) {
                if (res1.controls[i] && res1.controls[i].total && res2.controls[i] && res2.controls[i].total) {
                    var total1 = res1.controls[i].total;
                    var total2 = res2.controls[i].total;
                    total1 = total1 % 86400;
                    total2 = total2 % 86400;
                    return total1 > total2 ? 1 : -1;
                }
            }

            return 0;
        }

        var sortedResults = [];

        for (var i = currentCourse.length - 1; i >= 0; i--) {
            for (var j = 0; j < results.length;) {
                var result = results[j];
                var control = result.controls[i];
                if (control && control.total) {
                    var inserted = false;
                    for (var k = 0; k < sortedResults.length; k++) {
                        if (control.total < sortedResults[k].controls[i].total) {
                            sortedResults.splice(k, 0, result);
                            inserted = true;
                            break;
                        }
                    }

                    if (!inserted) {
                        sortedResults.push(result);
                    }
                    results.splice(j, 1);
                } else {
                    j++;
                }
            }
        }
        return sortedResults;
    }

    function getCourse(eventId) {
        var courseJson = localStorage.getItem("course" + eventId);
        if (!courseJson) {
            return [];
        }

        var course = JSON.parse(courseJson);
        return _.map(course, function (item) {
            return new paper.Point(item.x, item.y);
        });
    }

    function saveCourse(eventId) {
        var course = _.map(currentCourse, function (item) {
            return { x: item.x, y: item.y };
        });
        localStorage.setItem("course" + eventId, JSON.stringify(course));
    }

    var drawCourseEnabled = false;
    $("[data-event='drawCourse']").click(function () {
        $(this).hide();
        $("[data-event='stopDrawCourse']").show();
        drawCourseEnabled = true;
    });
    $("[data-event='stopDrawCourse']").click(function () {
        $(this).hide();
        $("[data-event='drawCourse']").show();
        drawCourseEnabled = false;
        saveCourse(currentEventId);
    });

    $("[data-event='deleteCourse']").click(function () {
        currentCourse = [];
        saveCourse(currentEventId);
        Canvas.updateCourseDrawing();
        DataService.notifyCourseChanged(currentCourse);
        paper.view.draw();
    });

    var DataService = {
        _callbacks: [],
        getCourse: getCourse,
        notify: function notify(callback) {
            DataService._callbacks.push(callback);
        },
        setResults: function setResults(results) {
            _.each(DataService._callbacks, function (callback) {
                callback(results);
            });
        },
        getEvents: GpsSeuranta.getEvents,
        getResults: function getResults(eventId, callback, course) {
            GpsSeuranta.getEvent(eventId, function (ev) {
                GpsSeuranta.getPoints(ev, 0, function (data) {

                    var results = _getResults(data, ev, course);
                    calculateErrors(results);
                    results = sortResults(results);
                    callback({
                        countControls: currentCourse.length - 2,
                        event: ev,
                        items: results,
                        points: data
                    });
                });
            });
        },
        _courseChangedCallbacks: [],
        onCourseChanged: function onCourseChanged(callback) {
            DataService._courseChangedCallbacks.push(callback);
        },
        notifyCourseChanged: function notifyCourseChanged(course) {
            _.each(DataService._courseChangedCallbacks, function (callback) {
                callback(course);
            });
        }
    };

    window.DataService = DataService;
    window.Canvas = Canvas;
})(jQuery);
