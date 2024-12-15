const Header = () => {
    return (
        <div className="header flex justify-between items-center p-1  bg-base-200">
            <div>
                <h1>IDE</h1>
            </div>
            <div>
                <button className="run-button btn btn-primary">Run</button>
            </div>
            <div>
                <button className="profile-button">Profile</button>
            </div>
        </div>
    );
}

export default Header;