import * as GpsSeuranta from './GpsSeuranta'
import * as CourseService from './CourseService'

var _callbacks =  [];

export function notify(callback) {
    _callbacks.push(callback);
}
export function setResults(results) {
    _.each(_callbacks, function (callback) {
        callback(results);
    });
}

export const getCourse = CourseService.getCourse
export const getEvents = GpsSeuranta.getEvents

export function getResults(eventId, callback, course) {
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
}
var _courseChangedCallbacks = [];
export function onCourseChanged(callback) {
    _courseChangedCallbacks.push(callback);
}
export function notifyCourseChanged(course) {
    _.each(_courseChangedCallbacks, function (callback) {
        callback(course);
    });
}

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
                var hasControl = true;
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

    var emptyResults = _.filter(results, r => _.all(r.controls, c => !c));
    return sortedResults.concat(_.sortBy (emptyResults, e => e.competitor.starttime))
}
