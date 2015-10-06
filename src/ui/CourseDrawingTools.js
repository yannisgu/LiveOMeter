import course from '../stores/CurrentCourseStore'
import app from '../app'

class CourseDrawingTools extends React.Component {
    constructor() {
        super()
        this.state = course.get();
    }

    drawCourse() {
        app.emit('startCourseDrawing');
    }
    stopDrawCourse() {
        app.emit('finishCourseDrawing');
    }
    deleteCourse() {
        app.emit('deleteCourseDrawing');
    }
    render() {
        return <div>
            <h1>Manage Course</h1>
            <button onClick={this.drawCourse} style={!this.state.drawingEnabled ? {} : {display: 'none'}}>Draw course</button>
            <button style={this.state.drawingEnabled ? {} : {display: 'none'}}  onClick={this.stopDrawCourse}>Finish drawing course</button>
            <button onClick={this.deleteCourse}>Delete course</button>
        </div>
    }
    componentDidMount() {
        course.on("update", value => this.setState(value))
    }
}


React.render(
    <CourseDrawingTools></CourseDrawingTools>,
    $("[data-role='editCourse']")[0]);
