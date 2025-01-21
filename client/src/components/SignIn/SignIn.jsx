import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/signin', { email, password });
            const { token, user } = response.data;
            console.log('Login Response:', response.data); // Log the response data
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('Stored User:', JSON.parse(localStorage.getItem('currentUser'))); // Verify stored user

            // Fetch user categories
            const categoriesResponse = await axios.get('http://localhost:5000/get-categories', {
                params: { email: user.email }
            });
            const userCategories = categoriesResponse.data.categories;
            console.log('Fetched User Categories:', userCategories); // Log the fetched categories
            localStorage.setItem('userCategories', JSON.stringify(userCategories));

            navigate('/', { state: { email, password, isSigningUp: true } });
        } catch (error) {
            setError(error.response.data.message);
        }
    };

    return (
        <div className="sign-in-container">
            <section className="sign-in">
                <h1>Sign In</h1>
                <form onSubmit={handleSignIn}>
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
                    <button className="btn primary" type="submit">Sign In</button>
                </form>
            </section>
        </div>
    );
};

export default SignIn;
