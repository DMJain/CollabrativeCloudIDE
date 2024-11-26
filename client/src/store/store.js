import { configureStore } from '@reduxjs/toolkit'

import playGroundReducer from './slices/playgroundSlice';

export const store = configureStore({
  reducer: {
    playground: playGroundReducer,
  },
  devTools: true
})