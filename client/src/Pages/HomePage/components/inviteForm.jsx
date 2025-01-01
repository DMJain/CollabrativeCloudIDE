import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useJoinInviteCode } from "../../../hooks/playGround.hooks";
import { setPlayGrountHost } from "../../../store/slices/playgroundSlice";

const InviteForm = () => {
    const [inviteCode, setInviteCode] = useState('');
    const {mutateAsync : joinPlayGround} = useJoinInviteCode();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInviteChange = (e) => {
        e.preventDefault();
        setInviteCode(e.target.value);
    }

    const handleJoinPlayground = async (e) => {
        e.preventDefault();
        const {data} = await joinPlayGround({inviteCode});
        navigateFunction(data);
    };

    const navigateFunction = (data) => {
        dispatch(setPlayGrountHost({
            playGroundHost: `http://localhost:${data.port}/`,
            playGroundContainerId: data.containerId,
            playGroundId: data.projectId
        })
        );
        setTimeout(() => {
            navigate('/playground');
        }, 300);
    }

    return (
        <div className='flex justify-between flex-col gap-2 border p-2 w-full'>
            <span className='text-center text-lg'>Join Project</span>
            <label>
                <span className='text-sm'>Invite Code</span>
                <input type='text' placeholder='Type Invite Code' className='input input-bordered w-full' value={inviteCode} onChange={handleInviteChange} />
            </label>
            <button className='btn' onClick={handleJoinPlayground}>Join</button>
        </div>
    );
}

export default InviteForm;