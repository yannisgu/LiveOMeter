import app from '../app'
import * as ResultService from '../data/ResultService'
import ResultsStore from '../stores/ResultsStore'
import course from '../stores/CurrentCourseStore'
import * as CourseService from '../data/CourseService'

app.on('changeCurrentEvent').subscribe(function(eventId) {
    course.get().course.set(CourseService.getCourse(eventId)).now();
    ResultsStore

    ResultService.getResults(eventId, function(results) {
        ResultsStore.get().set({eventId: eventId, results: results});
    }, course.get().course);
})
