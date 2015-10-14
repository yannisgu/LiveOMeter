import * as DataService from '../data/ResultService'
import ResultsStore from '../stores/ResultsStore'
import currentEvent from '../stores/CurrentEventStore'
import course from '../stores/CurrentCourseStore'

export function init() {
    currentEvent.on("update", function(value){
        draw(value.event)
    });
    ResultsStore.on("update", function(value) {
        drawCompetitors(value.results.points)
    });
}

export function draw(_event) {

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
        paper.project.activeLayer.appendBottom(raster);


    });

    $("body").append(img);

    var dragged = false;
    var tool = new paper.Tool();
    var last = null;
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
        if (course.get().drawingEnabled && !dragged) {
            course.get().course.push(event.point);
            updateCourseDrawing();
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

    updateCourseDrawing();
    paper.view.draw();
}

export function drawCompetitors(competitors) {
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

    updateCourseDrawing();
}

var currentControl = null;
export function drawControl(controlFrom, controlTo, trackpoints, color) {
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
}
var comparasionControls =  [];
export function drawComparasion(leg1, leg2) {
    for(var control in comparasionControls) {
        comparasionControls[control].remove();
    }

    comparasionControls = [drawControl(leg1.controlFrom, leg1.controlTo, leg1.trackpoints, 'red'), drawControl(leg2.controlFrom, leg2.controlTo, leg2.trackpoints, 'green')]
}


var _courseObjects = [];
export function updateCourseDrawing() {

    _.each(_courseObjects, function (i) {
        i.remove();
    });

    _.each(course.get().course, function (courseItem, key) {

        if (key == 0) {
            var paperItem = new paper.Path.RegularPolygon(courseItem, 3, 20);
            paperItem.strokeColor = '#800080';
            paperItem.strokeWidth = 3;
            _courseObjects.push(paperItem);
        } else if (key == course.get().course.length - 1) {
            var paperItem = new paper.Path.Circle(courseItem, 20);
            paperItem.strokeColor = '#800080';
            paperItem.strokeWidth = 3;
            _courseObjects.push(paperItem);

            paperItem = new paper.Path.Circle(courseItem, 25);
            paperItem.strokeColor = '#800080';
            paperItem.strokeWidth = 3;
            _courseObjects.push(paperItem);
        } else {
            var paperItem = new paper.Path.Circle(courseItem, 20);
            paperItem.strokeColor = '#800080';
            paperItem.strokeWidth = 3;
            _courseObjects.push(paperItem);
        }

        if (key != 0) {
            var lastItem = course.get().course[key - 1];
            var paperItem = new paper.Path.Line(lastItem, courseItem);
            paperItem.strokeColor = '#800080';
            paperItem.strokeWidth = 3;
            _courseObjects.push(paperItem);
        }
    });

    paper.view.draw();
}
