

const Header = () => {
    return (
        <div className="header flex justify-between items-center p-1 bg-base-200 w-full">
            <div className="text-2xl p-2">
                <h1>IDE</h1>
            </div>
            <div>
                <button className="run-button btn btn-primary">Run</button>
            </div>
            <div>
                
                <button className="btn">Profile</button>
            </div>
        </div>
    );
}

export default Header;