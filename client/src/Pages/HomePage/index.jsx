import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import { useCreatPlayGround } from '../../hooks/playGround.hooks';
import { setPlayGrountHost } from '../../store/slices/playgroundSlice';

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {mutateAsync : createPlayGround} = useCreatPlayGround();

    const handleClick = async (e) => {
        e.preventDefault();

        const {data} = await createPlayGround({image: 'reactbaseapp'});
        console.log('Data:', data);
        dispatch(setPlayGrountHost({
                playGroundHost: `http://localhost:${data.port}/`
            })
        );
        setTimeout(() => {
            navigate('/playground');
          }, 300);
    }

    return (
        <div>
            <h1>Home Page</h1>
            <button onClick={handleClick}>Go to Playground</button>
        </div>
    );
}

export default HomePage;