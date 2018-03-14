import React from 'react'
import { NumericInput } from './NumericInput'
import { TEXT_FIELDS, VALIDATION_MESSAGES, VALIDATION_TYPES } from '../../utils/constants'
import renderer from 'react-test-renderer'
import Adapter from 'enzyme-adapter-react-15'
import { configure, mount } from 'enzyme'

configure({ adapter: new Adapter() })

describe('NumericInput', () => {
  const INPUT_EVENT = {
    KEYPRESS: 'keypress',
    CHANGE: 'change',
    PASTE: 'paste'
  }

  let changeMock
  let keypressMock
  let pasteMock
  let numericInputComponent
  let wrapperMemo, wrapper
  let inputMemo, input

  beforeEach(() => {
    changeMock = { target: { value: '' } }

    keypressMock = { key: '1', preventDefault: jest.fn() }

    pasteMock = {
      preventDefault: jest.fn(),
      clipboardData: {
        getData: () => 'e123e123'
      }
    }

    numericInputComponent = {
      side: 'left',
      title: TEXT_FIELDS.DECIMALS,
      description:
        'Refers to how divisible a token can be, from 0 (not at all divisible) to 18 (pretty much continuous).',
      errorMessage: VALIDATION_MESSAGES.DECIMALS,
      onValueUpdate: jest.fn()
    }

    wrapperMemo = undefined
    wrapper = () => wrapperMemo || (wrapperMemo = mount(React.createElement(NumericInput, numericInputComponent)))

    inputMemo = undefined
    input = () => inputMemo || (inputMemo = wrapper().find('input').at(0))
  })

  it('Should render the component', () => {
    numericInputComponent.min = 0
    numericInputComponent.max = 18
    numericInputComponent.acceptFloat = true
    numericInputComponent.minDecimals = 0
    numericInputComponent.maxDecimals = 4

    expect(renderer.create(React.createElement(NumericInput, numericInputComponent)).toJSON()).toMatchSnapshot()
  })
  it('Should prevent pasting invalid value', () => {
    input().simulate(INPUT_EVENT.PASTE, pasteMock)
    expect(pasteMock.preventDefault).toHaveBeenCalled()
  })
  it('Should allow pasting valid value', () => {
    pasteMock.clipboardData.getData = () => '12'

    input().simulate(INPUT_EVENT.PASTE, pasteMock)
    expect(pasteMock.preventDefault).toHaveBeenCalledTimes(0)
  })
  it('Should call onValueUpdate callback on successful update', () => {
    changeMock.target.value = '10'

    input().simulate(INPUT_EVENT.CHANGE, changeMock)
    expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
    expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
      value: 10,
      pristine: false,
      valid: VALIDATION_TYPES.VALID
    })
  })

  describe('symbols', () => {
    it('Should consider empty string as valid', () => {
      input().simulate(INPUT_EVENT.CHANGE, changeMock)
      expect(numericInputComponent.onValueUpdate).toHaveBeenCalled()
    })

    describe('min', () => {
      it('Should accept "-" symbol if min is negative', () => {
        numericInputComponent.min = -10
        keypressMock.key = '-'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalledTimes(0)
      })
      it('Should accept "-" symbol if min is negative and accepts floating numbers', () => {
        numericInputComponent.min = -10
        numericInputComponent.acceptFloat = true
        keypressMock.key = '-'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalledTimes(0)
      })
      it('Should reject "-" symbol if min is not negative', () => {
        numericInputComponent.min = 0
        keypressMock.key = '-'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalled()
      })
    })

    describe('max', () => {
      it('Should accept "-" symbol if max is negative', () => {
        numericInputComponent.max = -10
        keypressMock.key = '-'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalledTimes(0)
      })
      it('Should accept "-" symbol if max is negative and accepts floating numbers', () => {
        numericInputComponent.max = -10
        numericInputComponent.acceptFloat = true
        keypressMock.key = '-'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalledTimes(0)
      })
      it('Should reject "-" symbol if max is not negative', () => {
        numericInputComponent.max = 10
        keypressMock.key = '-'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalled()
      })
    })

    it('Should prevent "." if no float is allowed', () => {
      numericInputComponent.value = '10'
      keypressMock.key = '.'

      input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
      expect(keypressMock.preventDefault).toHaveBeenCalledTimes(1)
    })

    it('Should prevent "+" if no float is allowed', () => {
      numericInputComponent.value = '10'
      keypressMock.key = '+'

      input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
      expect(keypressMock.preventDefault).toHaveBeenCalledTimes(1)
    })

    it('Should prevent "e" if no float is allowed', () => {
      numericInputComponent.value = '10'
      keypressMock.key = 'e'

      input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
      expect(keypressMock.preventDefault).toHaveBeenCalledTimes(1)
    })
  })

  describe('integer numbers', () => {
    describe('min', () => {
      it('Should fail if value is lesser than min', () => {
        numericInputComponent.min = 5
        changeMock.target.value = '4'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 4,
          pristine: false,
          valid: VALIDATION_TYPES.INVALID
        })
      })
      it('Should pass if value is greater than min', () => {
        numericInputComponent.min = 5
        changeMock.target.value = '8'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 8,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
    })

    describe('max', () => {
      it('Should fail if value is greater than max', () => {
        numericInputComponent.max = 15
        changeMock.target.value = '20'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 20,
          pristine: false,
          valid: VALIDATION_TYPES.INVALID
        })
      })
      it('Should pass if value is lesser than min', () => {
        numericInputComponent.max = 15
        changeMock.target.value = '10'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 10,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
    })
  })

  describe('float numbers', () => {
    beforeEach(() => {
      numericInputComponent.acceptFloat = true
      numericInputComponent.minDecimals = 2
      numericInputComponent.maxDecimals = 4
    })

    describe('maxDecimals', () => {
      it('Should fail if value has more decimals', () => {
        changeMock.target.value = '1.12345'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.12345,
          pristine: false,
          valid: VALIDATION_TYPES.INVALID
        })
      })
      it('Should pass if value has less decimals', () => {
        changeMock.target.value = '1.123'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.123,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
      it('Should pass if value has same decimals', () => {
        changeMock.target.value = '1.1234'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.1234,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
    })

    describe('minDecimals', () => {
      it('Should fail if value has less decimals', () => {
        changeMock.target.value = '1.1'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.1,
          pristine: false,
          valid: VALIDATION_TYPES.INVALID
        })
      })
      it('Should pass if value has more decimals', () => {
        changeMock.target.value = '1.1234'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.1234,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
      it('Should pass if value has same decimals', () => {
        changeMock.target.value = '1.12'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.12,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
    })

    describe('range [minDecimals, maxDecimals]', () => {
      it('Should fail for: 1.1, if it is outside the range', () => {
        changeMock.target.value = '1.1'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.1,
          pristine: false,
          valid: VALIDATION_TYPES.INVALID
        })
      })
      it('Should fail for: 1.12345, if it is outside the range', () => {
        changeMock.target.value = '1.12345'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.12345,
          pristine: false,
          valid: VALIDATION_TYPES.INVALID
        })
      })
      it('Should pass for: 1.12, if it is inside the range', () => {
        changeMock.target.value = '1.12'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.12,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
      it('Should pass for: 1.123, if it is inside the range', () => {
        changeMock.target.value = '1.123'

        input().simulate(INPUT_EVENT.CHANGE, changeMock)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledTimes(1)
        expect(numericInputComponent.onValueUpdate).toHaveBeenCalledWith({
          value: 1.123,
          pristine: false,
          valid: VALIDATION_TYPES.VALID
        })
      })
    })

    describe('dot notation', () => {
      it('Should reject float with dot notation', () => {
        numericInputComponent.acceptFloat = false
        numericInputComponent.value = 1

        keypressMock.key = '.'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalled()
      })
      it('Should accept float with dot notation', () => {
        numericInputComponent.minDecimals = 0
        numericInputComponent.value = 1

        keypressMock.key = '.'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalledTimes(0)
        expect()
      })
    })

    describe('scientific notation', () => {
      it('Should reject float with scientific notation', () => {
        numericInputComponent.acceptFloat = false
        numericInputComponent.value = 1

        keypressMock.key = 'e'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalled()
      })
      it('Should accept float with scientific notation', () => {
        numericInputComponent.value = 1

        keypressMock.key = 'e'

        input().simulate(INPUT_EVENT.KEYPRESS, keypressMock)
        expect(keypressMock.preventDefault).toHaveBeenCalledTimes(0)
      })
    })
  })
})
