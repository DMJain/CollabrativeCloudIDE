import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import { useCreatPlayGround, useGetAllPlayGround, useGetPlayGround } from '../../hooks/playGround.hooks';
import { setPlayGrountHost } from '../../store/slices/playgroundSlice';
import { useLoggedInUser} from '../../hooks/auth.hooks';
import { useEffect } from 'react';

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {mutateAsync : createPlayGround} = useCreatPlayGround();
    const {mutateAsync : getPlayGround} = useGetPlayGround();
    const { data: user, isLoading } = useLoggedInUser();
    const {data : projects} = useGetAllPlayGround();

    useEffect(() => {
        if(!user && isLoading){
            navigate('/sign-in');
        }
    }, [])

    const handleClick = async (e) => {
        e.preventDefault();
        const {data} = await createPlayGround({image: 'reactbaseapp'});
        navigateFunction(data);
    }

    const handleRun = async ({e, id}) => {
        e.preventDefault();
        const {data} = await getPlayGround({id});
        navigateFunction(data);
    }

    const navigateFunction = (data) => {
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
                <div className=''>
                    {projects && projects.map((project) => (
                        <div key={project._id} className='flex justify-between p-2 border-b'>
                            <div>{project.name}</div>
                            <button className='btn' onClick={(e) => handleRun({e, id:project._id})}>Run</button>
                        </div>
                    ))}

                </div>
            </div>
        </div>
        </div>
        
    );
}

export default HomePage;