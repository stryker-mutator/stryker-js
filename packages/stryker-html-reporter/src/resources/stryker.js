'use strict';

var hljs = require('highlight.js/lib/highlight.js');
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript.js'));

(function () {

  // Enable manually. If we enable on page load, click events for mutant labels might be overriden
  (function enableHighlightJS() {
    var codeBlocks = document.querySelectorAll('pre code');
    for (var i = 0; i < codeBlocks.length; i++) {
      hljs.highlightBlock(codeBlocks.item(i));
    }
  } ());

  // Create the maps of elements with mutants 
  var originalCodeMap = createMutantMap('stryker-original-code');
  var replacementMap = createMutantMap('stryker-mutant-replacement');
  var buttonMap = createMutantMap('stryker-mutant-button');

  // Controls
  var collapseExpandButton = document.getElementsByClassName('stryker-collapse-expand-all').item(0);
  var checkboxDisplayKilled = document.getElementsByClassName('stryker-display-killed').item(0);

  /** 
   * Creates a map of mutant id to elements using given class name to select the elements
   * Mutant id will be a data attribute (data-mutant="1")
   */
  function createMutantMap(className) {
    var map = Object.create(null);
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) {
      var element = elements.item(i);
      map[element.dataset.mutant] = element;
    }
    return map;
  }

  function toggleMutant(mutantId, force) {
    var button = buttonMap[mutantId];
    var antiForce = force === undefined ? undefined : !force;

    originalCodeMap[mutantId].classList.toggle('original-code-disabled', force);
    replacementMap[mutantId].hidden = force === undefined ? !replacementMap[mutantId].hidden : !force;
    var label = button.querySelectorAll('.label').item(0);
    label.classList.toggle('label-info', force);
    label.classList.toggle('label-' + button.dataset.mutantStatusAnnotation, antiForce);
  }

  function bindMutantButton(button, mutantId) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      toggleMutant(mutantId);
    }, false);
  }

  for (var i in buttonMap) {
    bindMutantButton(buttonMap[i], i);
  }

  var expand = false;
  collapseExpandButton.addEventListener('click', function (event) {
    event.preventDefault();
    expand = !expand;
    for (var index in buttonMap) {
      if (!buttonMap[index].hidden) {
        toggleMutant(index, expand);
      }
    }
    var newLabel = expand ? 'Collapse all' : 'Expand all';
    collapseExpandButton.textContent = newLabel;
  });

  function hideMutant(index, enableHide) {
    if (enableHide) {
      toggleMutant(index, !enableHide);
      replacementMap[index].hidden = enableHide;
    }
    buttonMap[index].hidden = enableHide;
  }

  function reflectCheckboxDisplayKilledValue() {
    for (var i in buttonMap) {
      if (buttonMap[i].dataset.mutantStatusAnnotation === 'success') {
        hideMutant(i, !checkboxDisplayKilled.checked);
      }
    }
  }

  checkboxDisplayKilled.addEventListener('change', reflectCheckboxDisplayKilledValue);
  reflectCheckboxDisplayKilledValue();
})();
