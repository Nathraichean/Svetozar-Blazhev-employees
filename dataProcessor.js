function processData(excelData) {

  const projectData = organizeDataToProjects(excelData);
  const coworkersData = calculateCoworkingPeriods(projectData);

  let maxWorkedHoursTogether = -1;
  let counter = 0;

  // Checks the most amount of hours worked together by two coworkers
  for (let employeePair in coworkersData){
    if (coworkersData[employeePair].totalDaysWorkedTogether > maxWorkedHoursTogether){
      maxWorkedHoursTogether = coworkersData[employeePair].totalDaysWorkedTogether;
    }
  }

  // Appends all pairs of employees who worked the most hours together to the "resut" HTML div.
  for (let employeePair in coworkersData){
    if(coworkersData[employeePair].totalDaysWorkedTogether == maxWorkedHoursTogether){
      counter++;
      document.getElementById('result').innerHTML += `<p class='small-box'>`+
      "Employee with ID: "+employeePair.split(',')[0] + ` worked with employee with ID: ` + employeePair.split(',')[1] + 
      ` for a total of ` + Math.round(maxWorkedHoursTogether) + ` hours on projects with ID's ` + coworkersData[employeePair].projectsWorkedOn + `</p>`;
    }
  }

  if (counter) document.getElementById("result").hidden = false;
  else document.getElementById("no-result").hidden = false;
}





// Returns an array of coworker pairs (keys) and their time worked together alongside projects they worked on (values).
function calculateCoworkingPeriods(projectsData) {

  let coworkingData = {};

  // Iterates every single project
  for (var projectId in projectsData) {

    //console.log(projectsData[projectId][0]);

    // Iterates every employee who worked on the iterated project
    for (let i = 0; i < projectsData[projectId].length - 1; i++) {

      // Iterates the rest of the entries for the project
      for (let j = i + 1; j < projectsData[projectId].length - 1; j++) {

        // Checks if the compared entries are for the same employee and skips the iteration if yes.
        if (projectsData[projectId][i].EmployeeID == projectsData[projectId][j].EmployeeID) {
          continue;
        }

        // Stores a property name in the format "employeeAID,employeeBID"
        let coworkersIdentifier = projectsData[projectId][i].EmployeeID + ',' + projectsData[projectId][j].EmployeeID;

        // Object init to set the value of the coworkers pair in the 'coworkingData' array
        let coworkersSharedWorkData = {
          totalDaysWorkedTogether: 0,
          projectsWorkedOn: []
        };

        // Checks if the current checked entries haven't worked together previously
        if (!coworkingData.hasOwnProperty(coworkersIdentifier)) {
          // Checks if the iterated pair's date periods overlap
          if (calculateEmployeeProjectOverlap(projectsData[projectId][i], projectsData[projectId][j]) != false) {

            // Adds the days they've worked on the project to the total current amount.
            coworkersSharedWorkData.totalDaysWorkedTogether += calculateEmployeeProjectOverlap(projectsData[projectId][i], projectsData[projectId][j]);
            coworkersSharedWorkData.projectsWorkedOn = [projectId];

            // Sets the final cumulative value for the pair of coworkers in 'coworkingData'
            coworkingData[coworkersIdentifier] = coworkersSharedWorkData;
          }

          //coworkingData[coworkersIdentifier] = "testval";
        }
        else {
          // Checks if the iterated pair's date periods overlap
          if (calculateEmployeeProjectOverlap(projectsData[projectId][i], projectsData[projectId][j]) != false) {

            // Adds the days they've worked on the project to the total current amount.
            coworkersSharedWorkData.totalDaysWorkedTogether += calculateEmployeeProjectOverlap(projectsData[projectId][i], projectsData[projectId][j]);

            // Checks if the project they've worked on is already added to 'coworkingData', if it isnt, adds it.
            if (!coworkingData[coworkersIdentifier].projectsWorkedOn.includes(projectId)) {
              coworkersSharedWorkData.projectsWorkedOn = [...coworkingData[coworkersIdentifier].projectsWorkedOn, projectId];
            }
            else coworkersSharedWorkData.projectsWorkedOn = coworkingData[coworkersIdentifier].projectsWorkedOn;

            // Sets the final cumulative value for the pair of coworkers in 'coworkingData'
            coworkingData[coworkersIdentifier] = coworkersSharedWorkData;
          }
        }

      }
    }
  }
  return coworkingData;
}






// Returns an array (of objects) of every project. 
// The properties/keys are the project IDs 
// and the values are every employee who worked on the project with the period they worked on it for.
function organizeDataToProjects(data) {

  // Init.
  let DateTime = luxon.DateTime;
  let projectData = {};
  

  data.forEach(row => {

    let projectId = row.ProjectID;

    // Checks if the row is valid, if not, skips the row.
    if (!validateRowData(row)) {
      document.getElementById('errors').hidden = false;
      return document.getElementById('errors').innerHTML += "<p class='small-box' style='background-color: lightcoral'>" + JSON.stringify(row) + `</p>`;
    }

    // Creates an object with the employee of the current row
    let rowEmployee = {};
    rowEmployee.EmployeeID = row.EmpID;
    rowEmployee.DateFrom = validateAndTransformDate(row.DateFrom);
    rowEmployee.DateTo = !validateAndTransformDate(row.DateTo) ? DateTime.now() : validateAndTransformDate(row.DateTo);
    
    // Checks if the project exists in the projectData variable and adds it as a new project if not
    if (!projectData.hasOwnProperty(projectId)) {
      projectData[projectId] = [rowEmployee];
    }
    // Adds to the existing project in projectData
    else {
      projectData[projectId] = [...projectData[projectId], rowEmployee];
    }
  });

  return projectData;
}






// Checks if date is in a usable format and returns it as a Luxon DateTime object.
// If invalid or past current datetime, returns false.
function validateAndTransformDate(input) {

  // TODO: Additonal acceptable date formats can be set here using luxon.

  let DateTime = luxon.DateTime;

  if (DateTime.fromISO(input).isValid) { return DateTime.fromISO(input) < DateTime.now() ? DateTime.fromISO(input) : false; }
  else if (DateTime.fromRFC2822(input).isValid) { return DateTime.fromRFC2822(input) < DateTime.now() ? DateTime.fromRFC2822(input) : false;  }
  else if (DateTime.fromHTTP(input).isValid) { return DateTime.fromHTTP(input) < DateTime.now() ? DateTime.fromHTTP(input) : false; }
  else if (DateTime.fromJSDate(input).isValid) { return DateTime.fromJSDate(input) < DateTime.now() ? DateTime.fromJSDate(input) : false; }
  else return false;

}






// Checks if data is in correct format; 
function validateRowData(row) {
  if (isNaN(row.EmpID) || isNaN(row.ProjectID) || validateAndTransformDate(row.DateFrom) == false) return false;
  else return true;
}






// Calculates days worked together on a single project. Returns false if their work on the project doesn't overlap. 
function calculateEmployeeProjectOverlap(employeeA, employeeB) {

  const Interval = luxon.Interval;

  // Creates luxon interval objects for start/end date of both employees for the provided data
  var employeeAInterval = Interval.fromDateTimes(employeeA.DateFrom,employeeA.DateTo);
  var employeeBInterval = Interval.fromDateTimes(employeeB.DateFrom,employeeB.DateTo);

  // Checks if the periods ovelap, returns false if they do not.
  if (employeeAInterval.overlaps(employeeBInterval)){
    // Returns the duration of the intersection in days
    var intersection = employeeAInterval.intersection(employeeBInterval);
    return intersection.e.diff(intersection.s, 'days').days;
  }
  else return false;
}