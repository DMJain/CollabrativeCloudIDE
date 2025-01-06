import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userName: "",
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.userName = action.payload.userName;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setUserDetails } = userSlice.actions

export default userSlice.reducer