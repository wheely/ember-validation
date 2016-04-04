import Ember from "ember";
import ComponentVaidation from 'ember-validation/mixins/component';
// import layout from '../templates/components/user-age-gender';

const { computed } = Ember;

const GENDERS = {
  MALE: "male",
  FEMALE: "female",
  UNKNOWN: "",
};

export default Ember.Component.extend(ComponentVaidation, {

  validationScheme: {
    gender: {
      options:{
        selector: '[name="gender"]'
      },
      validators: [
        { name: "required", options: { messages: {default: "gender_is_required"} } }
      ]
    },

    age: {
      options: {
        isUnknown: computed.equal("context.gender", GENDERS.UNKNOWN),
        condition: computed.not("isUnknown"),
        selector: '[name="age"]'
      },
      validators: [
        { name: "number", options: { min: 21, max: 65, messages: {not_number: "age_is_wrong_for_male", out_of_range: "age_is_wrong_for_male"}, condition: computed.equal("context.gender", GENDERS.MALE) } },
        { name: "number", options: { min: 18, max: 55, messages: {not_number: "age_is_wrong_for_female", out_of_range: "age_is_wrong_for_female"}, condition: computed.equal("context.gender", GENDERS.FEMALE) } }
      ]
    },
  },

});

