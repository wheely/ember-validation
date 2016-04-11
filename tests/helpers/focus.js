import { findElementWithAssert, findElement, buildSelector } from 'dummy/tests/page-object';
import Page from 'dummy/tests/page-object';
import Ceibo from 'ceibo';




export function focusIn(selector, options = {}) {
  return {
    isDescriptor: true,

    value() {
      const fullSelector = buildSelector(this, selector, options);
      const context = getContext(this);
      console.log('---->', context, fullSelector)
      // if (context && findElementWithAssert(this, selector)) {
      //   Ember.run(() => {
      //     context.$(fullSelector).focus();
      //   });
      // } else {
      //   /* global click */
      //   click(fullSelector);
      // }
      findElementWithAssert(this, selector).focus()
      triggerEvent(selector, 'focus')
      triggerEvent(selector, 'focusin')
      return this;
    }
  }
}

export function focusOut(selector, options = {}) {
  return {
    isDescriptor: true,

    value() {
      findElementWithAssert(this, selector).blur();
      triggerEvent(selector, 'blur');
      triggerEvent(selector, 'focusout');
      return this;
    }
  }
}

export function hasFocus(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return findElementWithAssert(this, selector, options).is(':focus');
    }
  }
}


