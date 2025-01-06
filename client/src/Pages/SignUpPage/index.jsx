import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoggedInUser, useSignup } from '../../hooks/auth.hooks';
import { setUserDetails } from '../../store/slices/userSlice';
import { useDispatch } from 'react-redux';

const SignupPage = () => {
    const navigate = useNavigate();
    const { data: user, isLoading } = useLoggedInUser();
    const dispatch = useDispatch();
    const { mutateAsync: signupAsync } = useSignup();

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState(null);

    useEffect(() => {
        if (user && !isLoading) {
            if(user.role === "admin") navigate('/admin');
            else {
                dispatch(setUserDetails({userName: `${user.firstName} ${user.lastName}`}));
                navigate('/');
            }
        }
    }, [user, navigate, isLoading]);

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number.';
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return 'Password must contain at least one special character (e.g., !@#$%^&*).';
        }
        return ''; // No errors
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Validate the password before making the API call
        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return; // Exit the function if the password is invalid
        } else {
            setPasswordError(null);
        }

        setIsSubmitting(true);

        try {
            await signupAsync({
                firstName: firstname,
                lastName: lastname,
                email,
                password,
            });
            console.log('Account created successfully!');
            setFirstname('');
            setLastname('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Signup failed:', error);
            //alert("Signup failed. Please try again.");
        } finally {
            setIsSubmitting(false);
            navigate('/');
        }
    };

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className="card bg-base-100 border border-base-200 w-full max-w-sm shrink-0 shadow-2xl">
                    <form className="card-body">
                    <div className="form-control">
                            <label className="label">
                                <span className="label-text">First Name</span>
                            </label>
                            <input
                                type="email"
                                placeholder="First Name"
                                className="input input-bordered"
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Last Name</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Last Name"
                                className="input input-bordered"
                                onChange={(e) => setLastname(e.target.value)}
                                required
                            />
                        </div>
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
                                <span className={`label-text` + (passwordError ? 'text-red-600' : '')}>Password {(passwordError ? ' - ' + passwordError : '')}</span>
                            </label>
                            <input
                                type="password"
                                placeholder={`password`}
                                className={`input input-bordered` + (passwordError ? ' input-error' : '')}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Confirm Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="confirm password"
                                className="input input-bordered"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button className="btn btn-primary" onClick={handleFormSubmit}>Create Account</button>
                        </div>
                    </form>
                </div>
        </div>
    );
};

export default SignupPage;
