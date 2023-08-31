// constructor
function Validator(options) {
  // get parent element
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  //object to store rules for all elements
  var rulesCollection = {};
  // handle validation and display errors
  function Validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    // console.log(errorElement);
    var errorMessage;
    // get rules array of each element from rulesCollection
    var elementRules = rulesCollection[rule.selector];
    // use for loop to check all rule. Using for loop because each rule has a different value
    for (var i = 0; i < elementRules.length; i++) {
      switch (inputElement.type) {
        // --------------NEED TO UPGRADE CASE RADIO, CHECKBOX,....---------
        // case "radio":
        //   errorMessage = elementRules[i](
        //     formElement.querySelector(rule.selector + ":checked")
        //   );
        //   break;
        default:
          errorMessage = elementRules[i](inputElement.value);
      }
      //check for validation error. If error is present, break loop
      if (errorMessage) break;
    }

    // console.log(elementRules);

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    // convert errorMessage into boolean type (false if error is present, true otherwise because of "!" before "errorMessage")
    return !errorMessage;
  }

  // handle select elements
  var formElement = document.querySelector(options.form);
  // execute all rules created inside rules array
  if (formElement) {
    formElement.onsubmit = function (event) {
      event.preventDefault();
      noErrorInForm = true;
      // check all input elements when submitting
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var noErrorHappened = Validate(inputElement, rule);
        // console.log(" no error in form", noErrorHappened);
        if (!noErrorHappened) {
          noErrorInForm = false;
        } else {
          noErrorInForm = true;
        }
      });
      // submit data if no error happened
      if (noErrorInForm) {
        //submit the form using javascript function
        if (typeof options.onSubmit === "function") {
          // select all elements have attribute name
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            values[input.name] = input.value;
            return values;
          },
          {});
          console.log(formValues);
          options.onSubmit(formValues);
          // submit the form using default action
        } else {
          formElement.submit();
        }
      } else {
        console.log("error happened");
      }
    };
    // looping through each rule and execute actions
    options.rules.forEach(function (rule) {
      // save the all rules of each input element
      if (Array.isArray(rulesCollection[rule.selector])) {
        rulesCollection[rule.selector].push(rule.test);
      } else {
        rulesCollection[rule.selector] = [rule.test];
      }
      // get the selector of each input element
      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        // handle blur events
        inputElement.onblur = function () {
          Validate(inputElement, rule);
        };
        //handle typing events
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorSelector);
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      });
    });
  }
  // console.log(rulesCollection);
}

// creating rules for rules array

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Please fill this field.";
    },
  };
};
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return emailRegex.test(value)
        ? undefined
        : message || "Please enter a valid email";
    },
  };
};
Validator.minLength = function (selector, minLength, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= minLength
        ? undefined
        : message || "Must be at least 6 characters long";
    },
  };
};
Validator.isMatch = function (selector, getMatchingValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getMatchingValue()
        ? undefined
        : message || "Input value must be matching";
    },
  };
};
