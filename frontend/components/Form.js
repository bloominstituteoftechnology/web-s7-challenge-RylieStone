import React, { useEffect, useState } from 'react'
import * as yup from "yup"
import axios from 'axios'
// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = yup.object().shape({
  fullName: yup.string().trim().required().max(20, validationErrors.fullNameTooLong).min(3, validationErrors.fullNameTooShort),
  size: yup.string().oneOf(["S", "M", "L"], validationErrors.sizeIncorrect),
  1: yup.boolean(),
  2: yup.boolean(),
  3: yup.boolean(),
  4: yup.boolean(),
  5: yup.boolean(),
})
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]
export default function Form() {
  const [formData, setFormData] = useState({
    fullName: "",
    size: "",
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  })
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    size: ""
  })
  const [disabled, setdisabled] = useState(true)
  const [failedres, setFailedres] = useState(false)
  const [successres, setSuccessres] = useState("")


  useEffect(() => {
    schema.isValid(formData).then(valid => setdisabled(!valid))
  }, [formData])
  const validator = (name, value) => {
    yup.reach(schema, name).validate(value).then(() => setFormErrors({...formErrors, [name]: ""})).catch(err => setFormErrors({...formErrors, [name]: err.errors[0]}))
  }
  const onChange = (evt) => {
    const {name, value, type, checked} = evt.target
    const useValue = type === "checkbox" ? checked : value
    setFormData({...formData, [name]: useValue})
    validator(name, useValue)
  }
  const onSubmit = evt => {
    evt.preventDefault()
    setdisabled(true)
    const filter = Object.keys(formData).filter(key => formData[key] === true)
    const data = {
      fullName: formData.fullName,
      size: formData.size,
      toppings: filter
    }
    axios.post("http://localhost:9009/api/order", data)
    .then(res => {
      setSuccessres(res.data.message)
      setFormData({
      fullName: "",
      size: "",
      1: false,
      2: false,
      3: false,
      4: false,
      5: false
    })
    })
    .catch(err => console.log(err))
  }
  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>
      {successres && <div className='success'>{successres}</div>}
      {failedres && <div className='failure'>Something went wrong</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" name='fullName' id="fullName" type="text" onChange={onChange} value={formData.fullName}/>
        </div>
        {formErrors.fullName && <div className='error'>{formErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" onChange={onChange} name='size' value={formData.size}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
        {formErrors.size && <div className='error'>{formErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => {
          return <label key={topping.topping_id}>
          <input
            name={topping.topping_id}
            checked={formData[topping.topping_id]}
            type="checkbox"
            onChange={onChange}
          />
          {topping.text}<br />
        </label>
        })}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={disabled}/>
    </form>
  )
}
