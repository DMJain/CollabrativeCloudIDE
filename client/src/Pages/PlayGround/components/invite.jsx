import { useEffect, useState } from 'react';
import {useGetInviteCode} from '../../../hooks/playGround.hooks';
import { useSelector } from 'react-redux';

const Invite = () => {
    const {mutateAsync: getInviteCode} = useGetInviteCode();
    const playground = useSelector((state) => state.playground);
    const [code, setCode] = useState('');
    const [copied, setCopied] = useState(false);

    const getCode = async () => {
        const {data} = await getInviteCode({id: playground.playGroundId});
        setCode(data.inviteCode);
    }

    useEffect(() => {
        getCode();
    }, [])

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };

    return (
        <div className={`p-2 border-dashed border rounded-lg m-3 ${copied ? 'border-accent' : 'border-base-300'}`}>
            <h1 className={`text-center border-b pb-2 ${copied ? 'border-b-accent' : ''}`}>Invitation Code</h1>
            <div className='flex justify-evenly items-center p-3 gap-2'>
                <p className='underline underline-offset-4'>{code}</p>
                <button 
                    onClick={handleCopy} 
                    className={`btn btn-sm ${copied ? 'border-accent' : ''}`} 
                    disabled={copied}
                >
                    {copied ? 'Code Copied' : 'Copy Code'}
                </button>
            </div>
        </div>
    );
}

export default Invite;
