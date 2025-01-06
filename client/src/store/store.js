import { configureStore } from '@reduxjs/toolkit'

import playGroundReducer from './slices/playgroundSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    playground: playGroundReducer,
    user: userReducer
  },
  devTools: true
})