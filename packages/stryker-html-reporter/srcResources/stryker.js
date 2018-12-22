'use strict';

var hljs = require('highlight.js/lib/highlight.js');
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript.js'));

(function () {

  // Enable manually. If we enable on page load, click events for mutant labels might be overridden
  (function enableHighlightJS() {
    var codeBlocks = document.querySelectorAll('pre code');
    for (var i = 0; i < codeBlocks.length; i++) {
      hljs.highlightBlock(codeBlocks.item(i));
    }
  }());

  // Create the maps of elements with mutants 
  var originalCodeMap = createMutantMap('stryker-original-code');
  var replacementMap = createMutantMap('stryker-mutant-replacement');
  var buttonMap = createMutantMap('stryker-mutant-button');
  initializePopovers();

  // Controls
  var collapseExpandButton = document.getElementsByClassName('stryker-collapse-expand-all').item(0);
  var displayCheckboxes = document.getElementsByClassName('stryker-display');

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

  function initializePopovers() {
    Object.keys(buttonMap).forEach(function (mutantId) {
      var $button = $(buttonMap[mutantId]);
      $button.popover({
        trigger: 'focus',
        placement: 'bottom'
      });
    });
  }


  function toggleMutant(mutantId, forceOpen) {
    var button = buttonMap[mutantId];
    var $button = $(button);
    var shouldOpen = forceOpen === undefined ? replacementMap[mutantId].hidden : forceOpen;
    if (forceOpen === undefined) {
      if (shouldOpen) {
        $button.popover('show');
      } else {
        $button.popover('hide');
      }
    }

    originalCodeMap[mutantId].classList.toggle('original-code-disabled', shouldOpen);
    replacementMap[mutantId].hidden = !shouldOpen;
    var label = button.querySelectorAll('.badge').item(0);
    label.classList.toggle('badge-info', shouldOpen);
    label.classList.toggle('badge-' + button.dataset.mutantStatusAnnotation, !shouldOpen);
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

  function updateMutantButtonsForCheckbox(checkbox) {
    var mutantState = checkbox.value;
    for (var i in buttonMap) {
      if (buttonMap[i].dataset.mutantStatus === mutantState) {
        hideMutant(i, !checkbox.checked);
      }
    }
  }

  for (var i = 0; i < displayCheckboxes.length; i++) {
    var checkbox = displayCheckboxes.item(i);
    checkbox.addEventListener('change', function (event) {
      updateMutantButtonsForCheckbox(event.target);
    });
    // Update them right away as well
    updateMutantButtonsForCheckbox(checkbox);
  }
})();
