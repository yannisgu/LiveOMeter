import app from '../app'
import course from '../stores/CurrentCourseStore'
import * as CourseService from '../data/CourseService'
import * as ResultService from '../data/ResultService'
import ResultsStore from '../stores/ResultsStore'

app.on('startCourseDrawing').subscribe(function() {
    course.get().set('drawingEnabled',true);
})


app.on('finishCourseDrawing').subscribe(function() {
    course.get().set('drawingEnabled',false);
})

course.on("update", function(value) {
    ResultService.getResults(ResultsStore.get().eventId, function(results) {
        ResultsStore.get().results.set(results);
    }, course.get().course);
});
