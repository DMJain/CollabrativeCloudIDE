import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playGroundHost: "",
  playGroundID: "",
}

export const playGroundSlice = createSlice({
  name: 'playground',
  initialState,
  reducers: {
    setPlayGrountHost: (state, action) => {
      state.playGroundHost = action.payload.playGroundHost;
      state.playGroundID = action.payload.playGroundID;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setPlayGrountHost } = playGroundSlice.actions

export default playGroundSlice.reducer