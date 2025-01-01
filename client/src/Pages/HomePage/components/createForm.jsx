import PropTypes from 'prop-types';

const CreateForm = ({name, setName, handleClick}) => {
    const handleNameChange = (e) => {
        e.preventDefault();
        setName(e.target.value);
     }
    return (
        <div className='flex justify-between flex-col gap-2 border p-2 w-full'>
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
    );
};
CreateForm.propTypes = {
    name: PropTypes.string.isRequired,
    setName: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
};

export default CreateForm;