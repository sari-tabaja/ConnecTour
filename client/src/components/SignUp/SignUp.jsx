import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:5000/signup', { fullName, email, password });
            alert(response.data.message);
            navigate('/select-categories', { state: { email, password, isSigningUp: true } });
           
        } catch (error) {
            setError(error.response ? error.response.data.message : 'Error signing up.');
        }
    };

    return (
        <div className="sign-up-container">
            <section className="sign-up">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignUp}>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                    />
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                    {error && <p className="error">{error}</p>}
                    <button className="btn primary" type="submit">Sign Up</button>
                </form>
            </section>
        </div>
    );
};

export default SignUp;
