import app from '../app'
import course from '../stores/CurrentCourseStore'
import * as CourseService from '../data/CourseService'
import * as ResultService from '../data/ResultService'
import ResultsStore from '../stores/ResultsStore'
import currentEvent from '../stores/CurrentEventStore'

app.on('startCourseDrawing').subscribe(function() {
    course.get().set('drawingEnabled',true);
})

app.on('deleteCourseDrawing').subscribe(function() {
    course.get().set({course: []});
});

app.on('finishCourseDrawing').subscribe(function() {
    course.get().set('drawingEnabled',false);
})

course.on("update", function(value) {
    ResultService.getResults(ResultsStore.get().eventId, function(results) {
        ResultsStore.get().results.set(results);
    }, course.get().course);
});


course.on("update", function(value) {
    var event = currentEvent.get().event;
    if(event) {
        CourseService.saveCourse(event.id, value.course)
    }
});
