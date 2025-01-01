import Invite from "./invite";

const Header = () => {
    return (
        <div className="header flex justify-between items-center p-1  bg-base-200">
            <div className="text-2xl p-2">
                <h1>IDE</h1>
            </div>
            <div>
                <button className="run-button btn btn-primary">Run</button>
            </div>
            <div>
                <button className="btn" onClick={()=>document.getElementById('inviteModal').showModal()}>Invite</button>
                <dialog id="inviteModal" className="modal">
                  <div className="modal-box">
                    <form method="dialog">
                      {/* if there is a button in form, it will close the modal */}
                      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <Invite />
                    <p className="text-xs px-4">Press ESC key or click on ✕ button to close</p>
                  </div>
                </dialog>
                <button className="btn">Profile</button>
            </div>
        </div>
    );
}

export default Header;