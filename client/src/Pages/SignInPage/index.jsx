import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoggedInUser, useSignin } from '../../hooks/auth.hooks';

const SignInPage = () => {
    const navigate = useNavigate();
    const { data: user, isLoading } = useLoggedInUser();
    const { mutateAsync: signinAsync } = useSignin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user && !isLoading) {
            if (user.role === 'admin') navigate('/admin');
            else navigate('/');
        }
    }, [user, navigate, isLoading]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        // Basic validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            setIsSubmitting(false);
            return;
        }

        try {
            await signinAsync({ email, password });
            // Redirect happens via the useLoggedInUser effect
        } catch (error) {
            console.error('Signin failed:', error);
            setErrorMessage(
                'Signin failed. Please check your credentials and try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const toSignUpPage = () => {
        navigate('/sign-up')
    }

    return (
        <div className="hero min-h-screen">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Login now!</h1>
                    <p className="py-6">
                    
                    </p>
                </div>
                <div className="card bg-base-100 border border-base-200 w-full max-w-sm shrink-0 shadow-2xl">
                    <form className="card-body">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="email"
                                className="input input-bordered"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="password"
                                className="input input-bordered"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* <label className="label">
                                <a
                                    href="#"
                                    className="label-text-alt link link-hover"
                                >
                                    Forgot password?
                                </a>
                            </label> */}
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary" onClick={handleFormSubmit}>Login</button>
                        </div>
                        <div className="divider">OR</div>
                        <div className="form-control">
                            <button className="btn btn-outline btn-primary" onClick={toSignUpPage}>SIGN-UP!</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
