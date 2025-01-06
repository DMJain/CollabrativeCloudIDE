import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  playGroundHost: "",
  playGroundContainerId: "",
  playGroundId: "",
  playGroundContainerIp: "",
}

export const playGroundSlice = createSlice({
  name: 'playground',
  initialState,
  reducers: {
    setPlayGrountHost: (state, action) => {
      state.playGroundHost = action.payload.playGroundHost;
      state.playGroundContainerId = action.payload.playGroundContainerId;
      state.playGroundId = action.payload.playGroundId;
      state.playGroundContainerIp = action.payload.playGroundContainerIp;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setPlayGrountHost } = playGroundSlice.actions

export default playGroundSlice.reducer