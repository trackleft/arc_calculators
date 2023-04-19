(($, Drupal, document, once) => {
  Drupal.arcTargetGPACalculator = Drupal.arcTargetGPACalculator || {};

  function updateUnitsNeededLabel(gradeLetter) {
    document.getElementById(
      'unitsNeededLabel',
    ).innerText = `Units of '${gradeLetter}' needed to achieve target GPA:`;
  }

  /**
   * Calculate target GPA.
   * See https://catalog.arizona.edu/policy/grade-point-average-gpa-calculation-or-averaging-grades.
   */
  Drupal.arcTargetGPACalculator.calculate = () => {
    let targetGPA = document.getElementById('targetGPA');
    let currentGPA = document.getElementById('cumulativeGPA');
    let currentUnits = document.getElementById('cumulativeUnits');

    if (!targetGPA.value) {
      targetGPA.setCustomValidity('Enter a valid target GPA value.');
      return;
    }
    targetGPA.setCustomValidity('');

    if (!currentGPA.value) {
      currentGPA.setCustomValidity('Enter a valid cumulative GPA value.');
      return;
    }
    currentGPA.setCustomValidity('');

    if (!currentUnits.value) {
      currentUnits.setCustomValidity(
        'Enter your number of cumulative units of credit.',
      );
      return;
    }
    currentUnits.setCustomValidity('');

    targetGPA = Number(targetGPA.value);
    currentGPA = Number(currentGPA.value);
    currentUnits = Number(currentUnits.value);

    if (targetGPA === 4 && currentGPA !== 4) {
      updateUnitsNeededLabel('A');
      document.getElementById('unitsNeeded').value = 'All grades must be 4.0';
      document.getElementById('unitsNeeded').classList.add('font-weight-bold');
      return;
    }
    document.getElementById('unitsNeeded').classList.remove('font-weight-bold');
    if (targetGPA === currentGPA) {
      document.getElementById('unitsNeeded').value = '0';
      return;
    }

    let courseGradePointNeeded;
    if (targetGPA >= 3 && targetGPA >= currentGPA) {
      updateUnitsNeededLabel('A');
      courseGradePointNeeded = 4.0;
    } else if ((targetGPA >= 2 && targetGPA > currentGPA) || targetGPA > 3) {
      updateUnitsNeededLabel('B');
      courseGradePointNeeded = 3.0;
    } else if ((targetGPA >= 1 && targetGPA > currentGPA) || targetGPA > 2) {
      updateUnitsNeededLabel('C');
      courseGradePointNeeded = 2.0;
    } else if ((targetGPA >= 1 && targetGPA > currentGPA) || targetGPA > 1) {
      updateUnitsNeededLabel('D');
      courseGradePointNeeded = 1.0;
    } else if (targetGPA <= currentGPA) {
      updateUnitsNeededLabel('E');
      courseGradePointNeeded = 0.0;
    }

    const unitsNeededResult =
      (currentUnits * (targetGPA - currentGPA).toFixed(3)) /
      (courseGradePointNeeded - targetGPA).toFixed(3);

    document.getElementById('unitsNeeded').value = Math.ceil(
      unitsNeededResult.toFixed(2),
    );
  };

  /**
   * Attaches behavior for Target GPA calculator.
   */
  Drupal.behaviors.arcTargetGPACalculator = {
    attach(context) {
      once(
        'target-gpa-calculator',
        document.getElementById('target-gpa-calculator'),
        context,
      ).forEach((calcElement) => {
        const frag = new DocumentFragment();

        const calcForm = document.createElement('form');
        calcForm.setAttribute(
          'onsubmit',
          'event.preventDefault(); return false;',
        );

        const calcTargetGPA = document.createElement('div');
        calcTargetGPA.className =
          'form-group text-center col-12 col-md-4 col-md-offset-4 mb-4';
        calcTargetGPA.innerHTML =
          "<label for='targetGPA'><strong>Target GPA</strong></label><div class='mx-6'><input type='text' class='form-control text-center' id='targetGPA' pattern='^[0-3](\\.[0-9]{1,2})?$|^4(\\.[0]{1,2})?$'></div>";
        calcForm.appendChild(calcTargetGPA);

        const calcGoalRow = document.createElement('div');
        calcGoalRow.className = 'd-flex flex-wrap align-items-end';

        const calcCumulativeGPA = document.createElement('div');
        calcCumulativeGPA.className = 'form-group col-12 col-md-3 text-center';
        calcCumulativeGPA.innerHTML =
          "<label for='cumulativeGPA'>Current cumulative GPA</label><div class='mx-6 mx-md-0'><input type='text' class='form-control' id='cumulativeGPA' pattern='^[0-3](\\.[0-9]{1,2})?$|^4(\\.[0]{1,2})?$'></div>";
        calcGoalRow.appendChild(calcCumulativeGPA);

        const calcCumulativeUnits = document.createElement('div');
        calcCumulativeUnits.className =
          'form-group col-12 col-md-3 text-center mb-4 mb-md-3';
        calcCumulativeUnits.innerHTML =
          "<label for='cumulativeUnits'>Cumulative units earned</label><div class='mx-6 mx-md-0'><input type='text' class='form-control' id='cumulativeUnits' pattern='^\\d*$'></div>";
        calcGoalRow.appendChild(calcCumulativeUnits);

        const calcButtonDiv = document.createElement('div');
        calcButtonDiv.className =
          'form-group col-12 col-md-3 mt-2 mb-4 mb-md-3';
        const calcButton = document.createElement('button');
        calcButton.className = 'btn btn-red w-100';
        calcButton.type = 'submit';
        calcButton.addEventListener('click', () => {
          Drupal.arcTargetGPACalculator.calculate();
        });
        calcButton.title =
          'Calculate the units needed to achieve your target GPA';
        calcButton.innerText = 'Calculate »';
        calcButtonDiv.appendChild(calcButton);
        calcGoalRow.appendChild(calcButtonDiv);

        const calcUnitsNeeded = document.createElement('div');
        calcUnitsNeeded.className = 'form-group col-12 col-md-3 text-center';
        calcUnitsNeeded.innerHTML =
          "<label id='unitsNeededLabel' for='unitsNeeded'></label><input type='text' class='form-control border-top-0 border-left-0 border-right-0 bg-transparent text-center' id='unitsNeeded' readonly=''>";
        calcGoalRow.appendChild(calcUnitsNeeded);

        calcForm.appendChild(calcGoalRow);
        frag.appendChild(calcForm);
        calcElement.appendChild(frag);

        updateUnitsNeededLabel('A');

        const targetGPAInput = document.getElementById('targetGPA');
        targetGPAInput.addEventListener('input', () => {
          if (targetGPAInput.validity.patternMismatch) {
            targetGPAInput.setCustomValidity('Enter a valid target GPA.');
          } else {
            targetGPAInput.setCustomValidity('');
          }
        });

        const currentGPAInput = document.getElementById('cumulativeGPA');
        currentGPAInput.addEventListener('input', () => {
          if (currentGPAInput.validity.patternMismatch) {
            currentGPAInput.setCustomValidity('Enter a valid cumulative GPA.');
          } else {
            currentGPAInput.setCustomValidity('');
          }
        });

        const unitsInput = document.getElementById('cumulativeUnits');
        unitsInput.addEventListener('input', () => {
          if (unitsInput.validity.patternMismatch) {
            unitsInput.setCustomValidity(
              'Enter your cumulative units of credit.',
            );
          } else {
            unitsInput.setCustomValidity('');
          }
        });
      });
    },
  };
})(jQuery, Drupal, this.document, once);
