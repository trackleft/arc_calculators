(($, Drupal, document, once) => {
  Drupal.arcGPACalculator = Drupal.arcGPACalculator || {};

  /**
   * Add rows to the GPA calculator table.
   *
   * @param {number} numberOfRowsToAdd The number of rows to add to the table.
   * @param {object} calcTableBodyElement The HTML element for the calculator table body.
   */
  Drupal.arcGPACalculator.addCalculatorRows = (
    numberOfRowsToAdd,
    calcTableBodyElement = null,
  ) => {
    let currentNumRows = 0;
    if (calcTableBodyElement === null) {
      calcTableBodyElement = document.getElementById(
        'gpa-calculator-table-body',
      );
      if (!calcTableBodyElement) {
        return;
      }
      currentNumRows = calcTableBodyElement.childElementCount;
    }

    for (let i = currentNumRows; i < numberOfRowsToAdd + currentNumRows; i++) {
      const newRow = document.createElement('tr');
      const newTDNum = document.createElement('td');
      newTDNum.className = 'align-middle';
      newTDNum.innerText = i + 1;
      const newTDCourse = document.createElement('td');
      newTDCourse.innerHTML =
        "<input type='text' class='course-field w-100' name='course' aria-label='Course Name'>";
      newTDCourse.className = 'pr-2 pr-md-5';

      const newTDGrade = document.createElement('td');
      newTDGrade.innerHTML =
        "<select class='grade-field p-1' name='grade' aria-label='Course Grade'><option value=''></option><option value='4'>A</option><option value='3'>B</option><option value='2'>C</option><option value='1'>D</option><option value='0'>E</option></select>";

      const newTDCredit = document.createElement('td');
      newTDCredit.innerHTML =
        "<input type='number' min='0' max='100' class='credit-field text-center' name='credit' aria-label='Units of Credit'>";

      newRow.appendChild(newTDNum);
      newRow.appendChild(newTDCourse);
      newRow.appendChild(newTDGrade);
      newRow.appendChild(newTDCredit);
      calcTableBodyElement.appendChild(newRow);
    }
  };

  /**
   * Calculate current term and overall GPA.
   * See https://catalog.arizona.edu/policy/grade-point-average-gpa-calculation-or-averaging-grades.
   */
  Drupal.arcGPACalculator.calculate = () => {
    let totalUnits = 0;
    let totalGradePoints = 0;
    let gpaResult = '';

    const tableBody = document.getElementById('gpa-calculator-table-body');
    tableBody.childNodes.forEach((tableRow) => {
      const courseGradeInput =
        tableRow.getElementsByClassName('grade-field')[0];
      const courseCreditInput =
        tableRow.getElementsByClassName('credit-field')[0];
      if (tableRow === tableBody.firstChild) {
        courseGradeInput.setCustomValidity('');
        courseCreditInput.setCustomValidity('');
      }
      if (courseGradeInput.value && courseCreditInput.value) {
        totalUnits += Number(courseCreditInput.value);
        totalGradePoints +=
          Number(courseCreditInput.value) * courseGradeInput.value;
      }
    });

    if (totalUnits) {
      gpaResult = (totalGradePoints / totalUnits).toFixed(2);
      document.getElementById('currentTermGPA').value = gpaResult;
    } else if (
      tableBody.firstChild.getElementsByClassName('grade-field')[0].value === ''
    ) {
      tableBody.firstChild
        .getElementsByClassName('grade-field')[0]
        .setCustomValidity(
          'Enter the grade and units of credit for at least one course.',
        );
    } else {
      tableBody.firstChild
        .getElementsByClassName('credit-field')[0]
        .setCustomValidity(
          'Enter the grade and units of credit for at least one course.',
        );
    }

    const prevGPAVal = document.getElementById('previousGPA').value;
    const prevCreditVal = document.getElementById('previousCredit').value;

    if (prevGPAVal && prevCreditVal) {
      totalUnits += Number(prevCreditVal);
      totalGradePoints += prevGPAVal * prevCreditVal;
      gpaResult = (totalGradePoints / totalUnits).toFixed(2);
      document.getElementById('overallGPA').value = gpaResult;
    }
  };

  /**
   * Attaches behavior for GPA calculator.
   */
  Drupal.behaviors.arcGPACalculator = {
    attach(context) {
      once(
        'gpa-calculator',
        document.getElementById('gpa-calculator'),
        context,
      ).forEach((calcElement) => {
        const frag = new DocumentFragment();

        const addRowButton = document.createElement('button');
        addRowButton.className = 'btn btn-red mb-3';
        addRowButton.type = 'button';
        addRowButton.addEventListener('click', () => {
          Drupal.arcGPACalculator.addCalculatorRows(1);
        });
        addRowButton.title = 'Add a row to the GPA Calculator table';
        addRowButton.innerText = 'Add Row';
        frag.appendChild(addRowButton);

        const calcForm = document.createElement('form');
        calcForm.setAttribute(
          'onsubmit',
          'event.preventDefault(); return false;',
        );

        const calcTable = document.createElement('table');
        calcTable.id = 'gpa-calculator-table';
        calcTable.className = 'table table-striped border-bottom';

        const calcTHead = document.createElement('thead');
        calcTHead.className = 'thead-dark';
        const calcTHeadTR = document.createElement('tr');
        calcTHeadTR.innerHTML =
          "<th scope='col'>#</th><th scope='col' class='col-6'>Course Name</th><th scope='col'>Grade</th><th scope='col' class='col-2 col-md-3'>Units of Credit</th>";
        calcTHead.appendChild(calcTHeadTR);
        calcTable.appendChild(calcTHead);

        const calcTBody = document.createElement('tbody');
        calcTBody.id = 'gpa-calculator-table-body';
        Drupal.arcGPACalculator.addCalculatorRows(6, calcTBody);
        calcTable.appendChild(calcTBody);
        calcForm.appendChild(calcTable);

        const calcCurrentTermGPARow = document.createElement('div');
        calcCurrentTermGPARow.className = 'form-group row mx-0';
        calcCurrentTermGPARow.innerHTML =
          "<label for='currentTermGPA' class='col-form-label pr-3 font-weight-bold'>Current Term GPA:</label><input type='text' class='form-control w-auto border-top-0 border-left-0 border-right-0 bg-transparent text-center' size='6' id='currentTermGPA' readonly=''>";
        calcForm.appendChild(calcCurrentTermGPARow);

        const calcPreviousInputRow = document.createElement('div');
        calcPreviousInputRow.className = 'form-row';

        const calcPrevGPA = document.createElement('div');
        calcPrevGPA.className = 'form-group col-12 col-md-4';
        calcPrevGPA.innerHTML =
          "<label for='previousGPA'>Previous Cumulative GPA</label><input type='text' class='form-control' id='previousGPA' pattern='^[0-3](\\.[0-9]{1,2})?$|^4(\\.[0]{1,2})?$' aria-describedby='previousGPAHelp'><small id='previousGPAHelp' class='form-text text-muted'>Current GPA</small>";
        calcPreviousInputRow.appendChild(calcPrevGPA);

        const calcPrevCredit = document.createElement('div');
        calcPrevCredit.className = 'form-group col-12 col-md-4';
        calcPrevCredit.innerHTML =
          "<label for='previousCredit'>Previous Cumulative Units Earned</label><input type='text' class='form-control' id='previousCredit' pattern='^\\d*$' aria-describedby='previousCreditHelp'><small id='previousCreditHelp' class='form-text text-muted'>Your total graded units (credit hours)</small>";
        calcPreviousInputRow.appendChild(calcPrevCredit);

        calcForm.appendChild(calcPreviousInputRow);

        const calcOverallGPARow = document.createElement('div');
        calcOverallGPARow.className = 'form-group row mx-0 mb-4';
        calcOverallGPARow.innerHTML =
          "<label for='overallGPA' class='col-form-label pr-3 font-weight-bold'>New Overall GPA:</label><input type='text' class='form-control w-auto border-top-0 border-left-0 border-right-0 bg-transparent text-center' size='6' id='overallGPA' readonly=''>";
        calcForm.appendChild(calcOverallGPARow);

        const calcButton = document.createElement('button');
        calcButton.className = 'btn btn-red mb-3';
        calcButton.type = 'submit';
        calcButton.addEventListener('click', () => {
          Drupal.arcGPACalculator.calculate();
        });
        calcButton.title = 'Calculate GPA value(s)';
        calcButton.innerText = 'Calculate';
        calcForm.appendChild(calcButton);

        frag.appendChild(calcForm);

        calcElement.appendChild(frag);

        const prevGPA = document.getElementById('previousGPA');
        prevGPA.addEventListener('input', () => {
          if (prevGPA.validity.patternMismatch) {
            prevGPA.setCustomValidity('Enter a valid cumulative GPA.');
          } else {
            prevGPA.setCustomValidity('');
          }
        });

        const prevCredit = document.getElementById('previousCredit');
        prevCredit.addEventListener('input', () => {
          if (prevCredit.validity.patternMismatch) {
            prevCredit.setCustomValidity(
              'Enter your cumulative units of credit.',
            );
          } else {
            prevCredit.setCustomValidity('');
          }
        });
      });
    },
  };
})(jQuery, Drupal, this.document, once);
