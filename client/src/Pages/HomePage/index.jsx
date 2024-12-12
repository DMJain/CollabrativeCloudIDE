import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import { useCreatPlayGround, useGetAllPlayGround } from '../../hooks/playGround.hooks';
import { setPlayGrountHost } from '../../store/slices/playgroundSlice';
import { useLoggedInUser} from '../../hooks/auth.hooks';
import { useEffect } from 'react';

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {mutateAsync : createPlayGround} = useCreatPlayGround();
    const { data: user, isLoading } = useLoggedInUser();
    const {data : projects} = useGetAllPlayGround();

    useEffect(() => {
        if(!user && isLoading){
            navigate('/sign-in');
        }
    }, [])

    console.log(projects)

    const handleClick = async (e) => {
        e.preventDefault();

        const {data} = await createPlayGround({image: 'reactbaseapp'});
        console.log('Data:', data);
        dispatch(setPlayGrountHost({
                playGroundHost: `http://localhost:${data.port}/`,
                playGroundID: data.containerId
            })
        );
        setTimeout(() => {
            navigate('/playground');
          }, 300);
    }

    return (
        <div>
            <div className='flex justify-center items-center h-screen'>
            <div className='h-96 border p-4 rounded-lg w-72'>
                <div className='flex justify-between'>
                    <select className='select w-full '> 
                        <option value='reactbaseapp'>React Base App</option>
                    </select>
                    <button className='btn' onClick={handleClick}>Create</button>
                </div>
                <div className=']'>

                </div>
            </div>
        </div>
        </div>
        
    );
}

export default HomePage;