# Svetozar-Blazhev-employees

Takes an input of an excel .csv file with columns "EmpID", "ProjectID", "DateFrom" and "DateTo".

Every row is an entry of which employee worked on which project for what period (from-to).

The application processes the following:
1. Stores an object of all projects with information on which employees worked on that project and for what period.
2. Calculates all pairs of employees who worked for any amount of time together on any amount of projects.
3. Displays the pairs of employees who worked on projects together for the most amount of time among all, alongside which projects they worked together on.
4. Validates rows and displays rows that weren't processed due to incorrect inputs.
5. Is able to handle multiple date formats and automatically takes the current date if "DateTo" is either incorrect or in the future.

Note :
More date formats can be manually added as needed in the validateAndTransformDate function (dataProcessor.js, line 157). 
Default formats are added, but can be extended depending on the need.

How to run :
Open "Parser.html" with a browser of your choosing, choose a file using the upload button (sample file provided in the project) and click "Submit".
Data will be filled underneath.

Data from points 1 and 2 are printed to the console.

Made by Svetozar Blazhev as a task provided by Sirma Solutions.
