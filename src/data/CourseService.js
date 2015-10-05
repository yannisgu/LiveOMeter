import * as DataService from './ResultService'
import * as Canvas from '../ui/MapCanvas'

function saveCourse(eventId) {
    var course = _.map(currentCourse, function (item) {
        return { x: item.x, y: item.y };
    });
    localStorage.setItem("course" + eventId, JSON.stringify(course));
}

export function init() {
    window.drawCourseEnabled = false;
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
}

export function getCourse(eventId) {
    var courseJson = localStorage.getItem("course" + eventId);
    if (!courseJson) {
        return [];
    }

    var course = JSON.parse(courseJson);
    return _.map(course, function (item) {
        return new paper.Point(item.x, item.y);
    });
}
