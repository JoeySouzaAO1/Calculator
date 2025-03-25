import { useReducer, useEffect, useCallback } from 'react';
import './Styles.css';
import DigitButton from './components/DigitButton';
import OperationButton from './components/OperationButton';


export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  CHOOSE_OPERATION: 'choose-operation',
  EVALUATE: 'evaluate'
}


function reducer(state, {type, payload}) {
  switch(type){
    case ACTIONS.ADD_DIGIT: 
    if (payload.digit === "0" && state.currentOperand == null) return state
    if (payload.digit === "." && state.currentOperand && state.currentOperand.includes(".")) return state
    if (state.overwrite) {
      // Check if the current operand ends with an operation
      if (state.currentOperand && /[+\-*÷/]$/.test(state.currentOperand)) {
        return {
          ...state,
          currentOperand: `${state.currentOperand}${payload.digit}`,
          overwrite: false
        }
      }
      return {
        ...state,
        currentOperand: payload.digit,
        overwrite: false
      }
    }
    return {
      ...state,
      currentOperand: `${state.currentOperand || ""}${payload.digit}`
    }

    case ACTIONS.CLEAR:
      return {}
    
    case ACTIONS.DELETE_DIGIT:
      if (state.currentOperand == null) return state
    
    if (state.overwrite) {return {
        ...state,
        overwrite: false,
        currentOperand: null
      }}
      if (state.currentOperand.length === 1){
        return{...state, currentOperand: null}
      }
    
    return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }

    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null) {
        if (payload.operation === "-") {
          return {
            ...state,
            currentOperand: "-"
          }
        }
        return state
      }
      
      return {
        ...state,
        currentOperand: `${state.currentOperand}${payload.operation}`
      }

    case ACTIONS.EVALUATE:
      if (state.currentOperand == null) return state
      try {
        // Replace ÷ with / for JavaScript evaluation
        const expression = state.currentOperand.replace(/÷/g, '/')
        // Use Function constructor to safely evaluate the expression
        const result = new Function(`return ${expression}`)()
        return {
          ...state,
          overwrite: true,
          previousOperand: state.currentOperand,
          operation: null,
          currentOperand: result.toString()
        }
      } catch (error) {
        return state
      }
  }
}

function evaluate (previousOperand, currentOperand, operation) {
  if (currentOperand === "-") return currentOperand

const prev = parseFloat(previousOperand)
const curr = parseFloat(currentOperand)
if (isNaN(prev) || isNaN(curr)) 
  return currentOperand || previousOperand || ""


let computation;
switch (operation) {
case "+":
  computation = prev + curr;
  break
  case "-":
  computation = prev - curr;
  break
  case "*":
  computation = prev * curr;
  break
  case "÷":
  case "/":
  computation = prev / curr;
  break
  default: 
  return ""
}
return computation.toString()
}

const INTEGER_FORMAT = new Intl.NumberFormat("en-us", {maximumFractionDigits: 0})

function formatOperand(operand) {
  if (operand == null) return
  if (operand === "-") return operand
  
  // If the operand contains operators, return it as is
  if (/[+\-*÷/]/.test(operand)) return operand
  
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMAT.format(integer)
  return `${INTEGER_FORMAT.format(integer)}.${decimal}`
}



function App () {
const [{previousOperand, currentOperand, operation}, dispatch] = useReducer(reducer, {})

const handleKeyDown = useCallback((e) => {
  const {key} = e;
  const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', 
    '9', '+', '-', '*', '÷', '/', '.', 'Enter','Return', 'Backspace', 'Delete']
    if (allowedKeys.includes(key)){
      e.preventDefault();
      console.log('Key pressed:', e.key);
      switch(key) {
        case 'Enter':
        case 'Return':
          dispatch ({type: ACTIONS.EVALUATE});
          break
        case 'Backspace':
        case 'Delete':
          dispatch ({type: ACTIONS.DELETE_DIGIT})
          break
        case '+':
        case '-':
        case '*':
        case '÷':
        case '/':
          dispatch ({type: ACTIONS.CHOOSE_OPERATION, payload: {operation: key}})
          break
        default: 
        dispatch ({type: ACTIONS.ADD_DIGIT, payload: {digit: key}})
      } 
    }
}, [dispatch])

useEffect(() => {
  window.addEventListener('keydown', handleKeyDown)
  return () => {
  window.removeEventListener('keydown', handleKeyDown)
  }
}, [handleKeyDown])
  
  return (
 <div className='calculator-grid'>
  <div className='output'>
    <div className='previous-operand'>{formatOperand(previousOperand)}</div>
    <div className='current-operand'>{formatOperand(currentOperand)}</div>
    </div>
    <button className='span-two' onClick={() => dispatch({type: ACTIONS.CLEAR})} >AC</button>
    <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}>DEL</button>
    <OperationButton operation="-" dispatch={dispatch} />
    <DigitButton digit="1" dispatch={dispatch} />
    <DigitButton digit="2" dispatch={dispatch} />
    <DigitButton digit="3" dispatch={dispatch} />
    <OperationButton operation="*" dispatch={dispatch} />
    <DigitButton digit="4" dispatch={dispatch} />
    <DigitButton digit="5" dispatch={dispatch} />
    <DigitButton digit="6" dispatch={dispatch} />
    <OperationButton operation="÷"  dispatch={dispatch} />
    <DigitButton digit="7" dispatch={dispatch} />
    <DigitButton digit="8" dispatch={dispatch} />
    <DigitButton digit="9" dispatch={dispatch} />
    <OperationButton operation="+" dispatch={dispatch} />
    <DigitButton digit="." dispatch={dispatch} />
    <DigitButton digit="0" dispatch={dispatch} />
    <button className='span-two' onClick={() => dispatch({type: ACTIONS.EVALUATE})}>=</button>
 </div>
  );
}

export default App;
