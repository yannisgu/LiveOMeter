import app from '../app'
import course from '../stores/CurrentCourseStore'
import * as CourseService from '../data/CourseService'

app.on('startCourseDrawing').subscribe(function() {
    course.get().set('drawingEnabled',true);
})


app.on('finishCourseDrawing').subscribe(function() {
    course.get().set('drawingEnabled',false);
})
