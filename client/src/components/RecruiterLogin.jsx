import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useEffect } from 'react';
import axios from 'axios'; // For making API calls
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; // for popup notifications


const RecruiterLogin = () => {

    const navigate = useNavigate()

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [image, setImage] = useState(false)

    const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false) //for buttons like next, submit during signup

    const {setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData} = useContext(AppContext)

    const onSubmitHandler = async(e) => {
        e.preventDefault();
        if(state === "Sign Up" && !isTextDataSubmitted){
            return setIsTextDataSubmitted(true) 
        }

        try{
            if(state === "Login"){
                const {data} = await axios.post(backendUrl+'/api/company/login', {email,password}) // Sending email and password to backend
                if(data.success){
                    console.log(data)
                    setCompanyToken(data.token)
                    setCompanyData(data.company)
                    localStorage.setItem('companyToken', data.token) //Store token in local storage
                    setShowRecruiterLogin(false) // Close the login model
                    navigate('/dashboard') // Navigate to dashboard
                }else{
                    toast.error(data.message)
                }
            }else{
                const formData = new FormData()
                formData.append('name', name)
                formData.append('email', email)
                formData.append('password', password)
                formData.append('image', image)

                const {data} = await axios.post(backendUrl+'/api/company/register', formData)
                if(data.success){
                    console.log(data)
                    setCompanyToken(data.token)
                    setCompanyData(data.company)
                    localStorage.setItem('companyToken', data.token) //Store token in local storage
                    setShowRecruiterLogin(false) // Close the login model
                    navigate('/dashboard') // Navigate to dashboard
                }else{
                    toast.error(data.message)
                }
            }
        }catch(error){
            toast.error(data.message)
        }
    }

    useEffect(() => { // to prevent scrolling when Recruiter login model is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        }
    },[])

  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex items-center justify-center'>
        <form onSubmit={onSubmitHandler} action="" className='relative bg-white p-10 rounded-xl text-slate-500'>
            <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
            <p className='text-sm'>Welcome back! Please sign in to continue</p>
            {
                state === "Sign Up" && isTextDataSubmitted
                ? <>
                <div className='flex items-center gap-4 my-10'>
                    <label htmlFor="image">
                        <img className='w-16 rounded-full cursor-pointer' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                        <input onChange={e => setImage(e.target.files[0])} type="file" id='image' hidden/>
                    </label>
                    <p>Upload Company <br /> Logo</p>
                </div>
                </>
                : <>

            {state !== 'Login' && (
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.person_icon} alt="" />
                <input className='outline-none text-sm' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Company Name' required/>
            </div>
            )}


            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.email_icon} alt="" />
                <input className='outline-none text-sm' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Id' required/>
            </div>

            <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.lock_icon} alt="" />
                <input className='outline-none text-sm' onChange={e => setPassword(e.target.value)} value={password} type="text" placeholder='Password' required/>
            </div>
            </>
            }

            {
                state === 'Login' && <p className='text-sm text-blue-600 mt-4 cursor-pointer'>Forgot Password?</p>
            }
            
            <button type="submit" className='bg-blue-600 w-full text-white py-2 rounded-full cursor-pointer mt-4'>
                {state === 'Login' ? 'Login' : isTextDataSubmitted ? 'Create Account' : 'Next'}
            </button>

            {
                state === 'Login'
                ? <p className='text-center mt-4'>Don't have an account? <span className='text-blue-600 cursor-pointer' onClick={() => setState('Sign Up')}>Sign Up</span></p>
                : <p className='text-center mt-4'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={() => setState('Login')}>Login</span></p>
            }

            <img onClick={ () => setShowRecruiterLogin(false) } src={assets.cross_icon} className='absolute top-5 right-5 cursor-pointer' alt="" />

        </form>
    </div>
  )
}

export default RecruiterLogin