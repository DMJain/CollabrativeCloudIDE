import {useNavigate} from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handleClick = (e) => {
        e.preventDefault();

        navigate('/playground');
    }

    return (
        <div>
            <h1>Home Page</h1>
            <button onClick={handleClick}>Go to Playground</button>
        </div>
    );
}

export default HomePage;