import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import { useCreatPlayGround, useGetAllPlayGround, useGetPlayGround} from '../../hooks/playGround.hooks';
import { setPlayGrountHost } from '../../store/slices/playgroundSlice';
import { useLoggedInUser} from '../../hooks/auth.hooks';
import { useEffect, useState } from 'react';
import { useSignOut} from "../../hooks/auth.hooks";
import CreateForm from './components/createForm';
import InviteForm from './components/inviteForm';

const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [name, setName] = useState('New Project');
    const {mutateAsync : createPlayGround} = useCreatPlayGround();
    const {mutateAsync : getPlayGround} = useGetPlayGround();
    const {mutateAsync : signOut} = useSignOut();
    const { data: user, isLoading } = useLoggedInUser();
    const {data : projects} = useGetAllPlayGround();
    const [showCreateForm, setShowCreateForm] = useState(true);

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

    const handleRun = async ({e, id}) => {
        e.preventDefault();
        const {data} = await getPlayGround({id});
        navigateFunction(data, id);
    }

    const navigateFunction = (data, id) => {
        dispatch(setPlayGrountHost({
            playGroundHost: `http://localhost:${data.port}/`,
            playGroundContainerId: data.containerId,
            playGroundId: id
        })
        );
        console.log('id', id)
        setTimeout(() => {
            navigate('/playground');
        }, 300);
    }

    const handleSwitch = () => {
        setShowCreateForm(!showCreateForm);
    }

    const handleLogOut = async (e) => {
        e.preventDefault();
        await signOut();
        window.location.reload();
    }

    return (
        <div>
            <div className='flex justify-center items-center h-screen'>
                <div className='h-2/3 border w-1/4 flex flex-col gap-2 p-2'>
                    <div className='flex justify-between flex-col gap-2 border-b p-2 w-full'>
                        {showCreateForm ? (
                            <CreateForm name={name} setName={setName} handleClick={handleClick}/>
                        ) : (
                            <InviteForm/>
                        )}
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
                <div className='h-2/3 p-2 flex flex-col gap-2'>
                    <button className='btn' onClick={handleSwitch}>{showCreateForm ? `Join a Friend` : `Create Playground` }</button>
                    <button className='btn' onClick={handleLogOut}>Log Out</button>
                </div>
            </div>
            
        </div>
        
    );
}

export default HomePage;