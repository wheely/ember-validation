import Ember from 'ember';
import ValidationMixin from 'ember-validation/mixins/validation';
import AttributeMediator from 'ember-validation/mediators/attribute';
import ValidatorMediator from 'ember-validation/mediators/validator';
import RequiredValidator from 'ember-validation/validators/required';
import Errors from 'ember-validation/core/errors';
import startApp from '../../helpers/start-app';
import { module, test } from 'qunit';

module('Unit | Mixin | validation', {
  integration: true,
  setup: function () {
    this.app = startApp();
  },
  teardown: function () {
    Ember.run(this.app, 'destroy');
  }
});

test('it works', function(assert) {
  var ValidationObject = Ember.Object.extend(ValidationMixin);
  var subject = ValidationObject.create();
  assert.ok(subject);
});

test('it has interface', function(assert) {
  var ValidationObject = Ember.Object.extend(ValidationMixin);
  var subject = ValidationObject.create();

  assert.ok(subject.get("isValidatable"), "It's validatable");
  assert.ok(Ember.typeOf(subject.validateByName) === "function", "It can run validation on attribute");
  assert.ok(Ember.typeOf(subject.check) === "function", "It can run check on object");
  assert.ok(Ember.typeOf(subject.checkByName) === "function", "It can run check on attribute");
});

test('is can run validation on attribute', function(assert) {
  var ValidationObject = Ember.Object.extend(ValidationMixin);
  var subject = ValidationObject.create();

  assert.throws(() => subject.validateByName(), "Throws an error when attribute name is not provided");
  assert.throws(() => subject.validateByName("attrName"), "Throws an error when mediator not found");
});

test('is creates mediators', function(assert) {
  const app = this.app;
  const container = app.__container__;
  const ValidationObject = Ember.Object.extend(ValidationMixin, {
    container: container,
    validationScheme: {
      number: {
        options: {
          testOption: true
        },
        validators: [
          { "name": "required", options: { testOption: true } },
          { "name": "number", options: { testOption: true } }
        ]
      }
    }
  });
  const subject = ValidationObject.create();
  const mediators = subject.get("mediators");

  assert.equal(mediators.length, 1, "Should be exactly 1 attribute mediator");

  const attributeMediator = mediators.get("firstObject");
  assert.ok(attributeMediator instanceof AttributeMediator, "Object contains in validation object's mediator collection is a AttributeMediator");
  assert.ok(attributeMediator.get("options"), "Attribute mediator should have options the same as they were declared");
  assert.ok(attributeMediator.get("context"), "Attribute mediator should have context");
  assert.equal(attributeMediator.get("context"), subject, "Attribute mediator's context should be object self");
  assert.ok(attributeMediator.get("attribute"), "Attribute mediator should have attribute name");

  assert.ok(attributeMediator.get("testOption"), "The object declared in the attr `options` of the validationScheme should be mixed into the attribute mediator");
  assert.equal(Ember.typeOf(attributeMediator.pushObject), "function", "Attribute mediator should be enum object");
  assert.ok(attributeMediator.get("content"), "Attribute mediator should have content");
  assert.equal(attributeMediator.get("length"), 2, "Attribute mediator should contain exactly 2 validators");

  const validatorMediator = attributeMediator.get("firstObject");
  assert.ok(validatorMediator instanceof ValidatorMediator, "Object contains in validation object's mediator collection is a AttributeMediator");
  assert.ok(validatorMediator.get("options"), "Validator mediator should have options the same as they were declared");
  assert.ok(validatorMediator.get("context"), "Validator mediator should have context");
  assert.equal(validatorMediator.get("context"), subject, "Validator mediator's context should be object self");
  assert.ok(validatorMediator.get("attribute"), "Validator mediator should have attribute name");

  assert.ok(validatorMediator.get("testOption"), "The object declared in the validator `options` of the validationScheme should be mixed into the validator mediator");
  assert.ok(validatorMediator.get("validator") instanceof RequiredValidator, "First validator mediator should contain `required` validator");


  const ValidationObject_1 = Ember.Object.extend(ValidationMixin, {
    container: container
  });

  const subject_1 = ValidationObject_1.create();
  const mediators_1 = subject_1.get("mediators");

  assert.equal(mediators_1.length, 0, "Object without validationScheme doesn't have mediators");

});

test('it works with object\'s errors', function(assert) {

  expect(5);

  const app = this.app;
  const container = app.__container__;

  var ValidationObject = Ember.Object.extend(ValidationMixin, {
    container: container,
    validationScheme: {
      attribute: {
        options: { condition: Ember.computed.alias("context.flag") },
        validators: [
          { "name": "required" }
        ]
      }
    },
    flag: true,
    attribute: ""
  });

  var subject = ValidationObject.create();

  assert.ok(subject.get("errors") instanceof Errors, "Error collection should be added if object doesn't have its own");

  assert.equal(subject.get("errors").get("length"), 0, "Subject doesn't have errors before validation");

  subject.validate().catch(() => {
    assert.equal(subject.get("errors.length"), 1, "If validation failed object should get errors");
  });

  const mediators = subject.get("mediators");
  const attributeMediator = mediators.get("firstObject");

  subject.validate().catch(() => {
    assert.equal(subject.get("errors.length"), 1, "The object should contain only 1 error");
    attributeMediator.on("conditionChanged", () => {
      Ember.run.scheduleOnce("actions", this, () => {
        assert.equal(subject.get("errors.length"), 0, "When attribute validation condition changes it flushed field's errors");
      });
   });

    subject.set("flag", false);
 });

});

test('it validates', function(assert) {
  assert.ok(true);
});

test('it checks', function(assert) {
  assert.ok(true);
});

test('it\'s inheritable', function(assert) {
  const app = this.app;
  const container = app.__container__;
  const User = Ember.Object.extend(ValidationMixin, {
    container: container,
    validationScheme: {
      name: {
        validators: [
          { "name": "required" }
        ]
      },
      age: {
        validators: [
          { "name": "required" }
        ]
      }
    },
    name: ""
  });

  const Driver = User.extend(ValidationMixin, {
    container: container,
    validationScheme: {
      phone: {
        validators: [
          { "name": "required" }
        ]
      }
    },
    phone: ""
  });


  const Employee = User.extend(ValidationMixin, {
    container: container,
    validationScheme: {
      age: {
        validators: [
          { "name": "number" }
        ]
      }
    },
    phone: ""
  });


  const user = User.create();
  const driver = Driver.create();
  const employee = Employee.create();

  const userMediators = user.get("mediators");
  const driverMediators = driver.get("mediators");
  const employeeMediators = employee.get("mediators");

  assert.equal(userMediators.get("length"), 2, "The user has 2 mediators");
  assert.equal(driverMediators.get("length"), 3, "The driver has 2 mediators from user and 1 its own, in total 3");
  assert.equal(employeeMediators.get("length"), 2, "The employee has 2 mediators");
});

test('it validates', function(assert) {
  assert.ok(true);
});
