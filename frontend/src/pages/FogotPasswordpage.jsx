import React from 'react'
import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../apis'
import logo from '../assets/logo.png'

function FogotPasswordpage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(0);

    const navigate = useNavigate()

    const requestResetPassword = async () => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await api.post('/api/users/requestpasswordreset', { email })
            setSuccess(response.data.message)
            setLoading(false)
        }
        catch (error) {
            setError(error.response.data.message)
            setLoading(false)
        }
        finally {
            setLoading(false)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
       requestResetPassword()
    };
    const handleResend=()=>{
        if(timer>0){
            return requestResetPassword()
        }
    };
    useEffect(() => {
        let interval;
        if (timer <= 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-100'>
        <div className='bg-white p-8 rounded shadow-md w-96'>
            {/*logo*/}
            <img src={logo} alt="Logo" className='w-32 mx-auto mb-4' />
            <h2 className='text-2xl font-bold mb-4 text-center'>Forgot Password</h2>
            {error && <p className='text-red-500 mb-4'>{error}</p>}
            {success && <p className='text-green-500 mb-4'>{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className='mb-4'>
                    <label htmlFor='email' className='block text-gray-700 font-bold mb-2'>Email</label>
                    <input
                        type='email'
                        id='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-3 py-2 border rounded'
                        required
                    />
                </div>
                <button
                    type='submit'
                    className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            <div className='mt-4 text-center'>
                <p>Didn't receive the email? <button onClick={handleResend} className={`text-blue-500 underline ${timer > 0 ? 'cursor-not-allowed opacity-50' : ''}`} disabled={timer > 0}>Resend</button></p>
                {timer > 0 && <p className='text-gray-500'>You can resend the email in {timer} seconds.</p>}
            </div>

        </div>
    </div>
  )
}

export default FogotPasswordpage