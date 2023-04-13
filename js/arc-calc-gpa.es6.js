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
        "<input type='text' class='course-field w-100' name='course'>";
      newTDCourse.className = 'pr-2 pr-md-5';

      const newTDGrade = document.createElement('td');
      newTDGrade.innerHTML =
        "<select class='grade-field p-1' name='grade'><option value=''></option><option value='4'>A</option><option value='3'>B</option><option value='2'>C</option><option value='1'>D</option><option value='0'>E</option></select>";

      const newTDCredit = document.createElement('td');
      newTDCredit.innerHTML =
        "<input type='number' min='0' max='100' class='credit-field text-center' name='credit'>";

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
        totalUnits += courseCreditInput.value;
        totalGradePoints += courseCreditInput.value * courseGradeInput.value;
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
          'Enter the grade and credits earned for at least one course.',
        );
    } else {
      tableBody.firstChild
        .getElementsByClassName('credit-field')[0]
        .setCustomValidity(
          'Enter the grade and credits earned for at least one course.',
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

        const gpaCalcForm = document.createElement('form');
        gpaCalcForm.setAttribute(
          'onsubmit',
          'event.preventDefault(); return false;',
        );

        const gpaCalcTable = document.createElement('table');
        gpaCalcTable.id = 'gpa-calculator-table';
        gpaCalcTable.className = 'table table-striped border-bottom';

        const gpaCalcTHead = document.createElement('thead');
        gpaCalcTHead.className = 'thead-dark';
        const gpaCalcTHeadTR = document.createElement('tr');
        gpaCalcTHeadTR.innerHTML =
          "<th scope='col'>#</th><th scope='col' class='col-6'>Course Name</th><th scope='col'>Grade</th><th scope='col' class='col-2 col-md-3'>Credits Earned</th>";
        gpaCalcTHead.appendChild(gpaCalcTHeadTR);
        gpaCalcTable.appendChild(gpaCalcTHead);

        const gpaCalcTBody = document.createElement('tbody');
        gpaCalcTBody.id = 'gpa-calculator-table-body';
        Drupal.arcGPACalculator.addCalculatorRows(6, gpaCalcTBody);
        gpaCalcTable.appendChild(gpaCalcTBody);
        gpaCalcForm.appendChild(gpaCalcTable);

        const calcCurrentTermGPARow = document.createElement('div');
        calcCurrentTermGPARow.className = 'form-group row mx-0';
        calcCurrentTermGPARow.innerHTML =
          "<label for='currentTermGPA' class='col-form-label pr-3 font-weight-bold'>Current Term GPA:</label><input type='text' class='form-control w-auto' size='8' id='currentTermGPA' readonly=''>";
        gpaCalcForm.appendChild(calcCurrentTermGPARow);

        const calcPreviousInputRow = document.createElement('div');
        calcPreviousInputRow.className = 'form-row';

        const gpaCalcPrevGPA = document.createElement('div');
        gpaCalcPrevGPA.className = 'form-group col-12 col-md-4';
        gpaCalcPrevGPA.innerHTML =
          "<label for='previousGPA'>Previous Cumulative GPA</label><input type='text' class='form-control' id='previousGPA' pattern='^\\d*(\\.\\d{0,2})?$' aria-describedby='previousGPAHelp'><small id='previousGPAHelp' class='form-text text-muted'>Current GPA</small>";
        calcPreviousInputRow.appendChild(gpaCalcPrevGPA);

        const gpaCalcPrevCredit = document.createElement('div');
        gpaCalcPrevCredit.className = 'form-group col-12 col-md-4';
        gpaCalcPrevCredit.innerHTML =
          "<label for='previousCredit'>Previous Cumulative Credits Earned</label><input type='text' class='form-control' id='previousCredit' pattern='^\\d*$' aria-describedby='previousCreditHelp'><small id='previousCreditHelp' class='form-text text-muted'>Your total graded units (credit hours)</small>";
        calcPreviousInputRow.appendChild(gpaCalcPrevCredit);

        gpaCalcForm.appendChild(calcPreviousInputRow);

        const calcOverallGPARow = document.createElement('div');
        calcOverallGPARow.className = 'form-group row mx-0';
        calcOverallGPARow.innerHTML =
          "<label for='overallGPA' class='col-form-label pr-3 font-weight-bold'>Overall GPA:</label><input type='text' class='form-control w-auto' size='8' id='overallGPA' readonly=''>";
        gpaCalcForm.appendChild(calcOverallGPARow);

        const calcButton = document.createElement('button');
        calcButton.className = 'btn btn-red mb-3';
        calcButton.type = 'submit';
        calcButton.addEventListener('click', () => {
          Drupal.arcGPACalculator.calculate();
        });
        calcButton.title = 'Calculate ';
        calcButton.innerText = 'Calculate';
        gpaCalcForm.appendChild(calcButton);

        frag.appendChild(gpaCalcForm);

        calcElement.appendChild(frag);

        const prevGPA = document.getElementById('previousGPA');
        prevGPA.addEventListener('input', () => {
          if (prevGPA.validity.patternMismatch) {
            prevGPA.setCustomValidity('Enter a number value for your GPA.');
          } else {
            prevGPA.setCustomValidity('');
          }
        });

        const prevCredit = document.getElementById('previousCredit');
        prevCredit.addEventListener('input', () => {
          if (prevCredit.validity.patternMismatch) {
            prevCredit.setCustomValidity('Enter your number of credit hours.');
          } else {
            prevCredit.setCustomValidity('');
          }
        });
      });
    },
  };
})(jQuery, Drupal, this.document, once);
