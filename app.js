"use strict";
var fs = require('fs');

var coursesObj = {};
var marksObj = {};
var studentsObj = {};
var testsObj = {};

function createObject(keysArray, linesArray) {
    var objects = {};
    for (var i = 1; i < linesArray.length; i++) {
        if (linesArray[i]) {
            var valuesArray = linesArray[i].split(',');
            for (var j = 1; j < valuesArray.length; j++) {
                objects[valuesArray[0]] = {
                    ...objects[valuesArray[0]],
                    [keysArray[j]]: valuesArray[j]
                }
            }
        }
    }
    return objects;
}

function inputMarksIntoStudents(keysArray, linesArray) {

    for (var i = 1; i < linesArray.length; i++) {
        if (linesArray[i]) {
            var valuesArray = linesArray[i].split(',');
            var test_id = valuesArray[0];
            var student_id = valuesArray[1];
            var mark = valuesArray[2];
            var testPercentage = mark * testsObj[test_id].weight / 100;
            var course_id = testsObj[test_id].course_id;

            //check to see if courses is a property in studentsObj
            if (studentsObj[student_id].courses) {
                //check to see if the course is in courses is a property in studentsObj
                if (studentsObj[student_id].courses[course_id]) {
                    studentsObj[student_id].courses[course_id].grades.push(testPercentage);
                } else {
                    //create the course
                    studentsObj[student_id].courses[course_id] = { grades: [testPercentage] };
                }
            } else {
                //create the courses property and add the course
                studentsObj[student_id].courses = { [course_id]: { grades: [testPercentage] } };
            }
        }
    }
}

function inputCoursesAverage() {
    //getting test average for each course
    for (const student_id in studentsObj) {
        for (const course_id in studentsObj[student_id].courses) {
            var sum = 0;
            sum = studentsObj[student_id].courses[course_id].grades.reduce((a, b) => (+a) + (+b), sum);
            studentsObj[student_id].courses[course_id].courseAverage = sum.toFixed(2);
        }
    }
}


function readFile(fileName) {

    try {
        var data = fs.readFileSync(fileName, 'utf8', { encoding: 'utf8' });

    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('File ' + fileName + ' not found!');
        } else {
            throw err;
        }
    }
    var linesArray = data.toString().split(/\r?\n/);
    var keysArray = linesArray[0].split(',');

    switch (fileName) {
        case 'courses.csv':
            coursesObj = createObject(keysArray, linesArray);
            break;
        case 'marks.csv':
            inputMarksIntoStudents(keysArray, linesArray);
            inputCoursesAverage();
            break;
        case 'tests.csv':
            testsObj = createObject(keysArray, linesArray);
            break;
        case 'students.csv':
            studentsObj = createObject(keysArray, linesArray);
            break;
        default:
        // code block
    }
}

function getTotalAverage(student_id) {
    var sum = 0;
    var num = 0;
    for (const course_id in studentsObj[student_id].courses) {
        sum += (+studentsObj[student_id].courses[course_id].courseAverage);
        num++;
    }

    return (sum / num).toFixed(2);
}

function getStudentCourses(student_id) {
    var courses = [];

    for (const course_id in studentsObj[student_id].courses) {
        courses.push({
            id: course_id,
            name: coursesObj[course_id].name,
            teacher: coursesObj[course_id].teacher,
            courseAverage: studentsObj[student_id].courses[course_id].courseAverage
        });
    }
    return courses;
}

function generateReportCards() {
    var studentReportCards = { students: [] };

    for (const property in studentsObj) {
        studentReportCards.students.push({
            id: property,
            name: studentsObj[property].name,
            totalAverage: getTotalAverage(property),
            courses: getStudentCourses(property)
        });
    }

    return studentReportCards;
}

function writeFile(data, outputFilename) {

    fs.writeFile('./' + outputFilename, JSON.stringify(data), err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
}

(function main() {
    var marksFile;
    var outputFilename = process.argv[process.argv.length - 1];

    for (let i = 2; i < process.argv.length - 1; i++) {
        if (process.argv[i] === 'marks.csv') {
            marksFile = process.argv[i];
            continue;
        }
        readFile(process.argv[i]);
        readFile
    }
    readFile(marksFile);

    writeFile(generateReportCards(), outputFilename);
})();