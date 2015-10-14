import * as DataService from './ResultService'
import * as Canvas from '../ui/MapCanvas'

export function saveCourse(eventId, course) {
    var course = _.map(course, function (item) {
        return { x: item.x, y: item.y };
    });
    localStorage.setItem("course" + eventId, JSON.stringify(course));
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
