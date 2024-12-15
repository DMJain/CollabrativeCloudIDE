import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import { useCreatPlayGround, useGetAllPlayGround, useGetPlayGround } from '../../hooks/playGround.hooks';
import { setPlayGrountHost } from '../../store/slices/playgroundSlice';
import { useLoggedInUser} from '../../hooks/auth.hooks';
import { useEffect, useState } from 'react';

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [name, setName] = useState('New Project');
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
        const {data} = await createPlayGround({image: 'reactbaseapp', name: name});
        navigateFunction(data);
    }

    const handleNameChange = (e) => {
        e.preventDefault();
        setName(e.target.value);
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
            <div className='h-2/3 border w-1/4 flex flex-col gap-2 p-2'>
                <div className='flex justify-between flex-col gap-2 border-b p-2'>
                    <span className='text-center text-lg'>Create Project</span>
                    <label>
                    <span className='text-sm'>Select Project</span>
                    <select className='select select-bordered w-full'> 
                        <option value='reactbaseapp'>React Base App</option>
                    </select>
                    </label>
                    <label>
                        <span className='text-sm'>Project Name</span>
                    <input type='text' placeholder='Type Project Name' className='input input-bordered w-full' value={name} onChange={handleNameChange} />
                    </label>
                    <button className='btn' onClick={handleClick}>Create</button>
                </div>
                <div className='flex justify-between flex-col gap-2 p-2'>
                    <span className='text-center text-lg'>Projects</span>
                <div className='p-2 overflow-y-auto grid grid-cols-1 gap-2'>
                    {projects && projects.map((project) => (
                        <div key={project._id} className='flex justify-between p-2 items-center shadow-md border'>
                            <div className='text-center w-full'>{project.name}</div>
                            <button className='btn ' onClick={(e) => handleRun({e, id:project._id})}>Run</button>
                        </div>
                    ))}

                </div>
                </div>
            </div>
        </div>
        </div>
        
    );
}

export default HomePage;