import { configureStore } from '@reduxjs/toolkit';
import chainReducer from './slices/chainSlice';
import postsReducer from './slices/postsSlice';

export const store = configureStore({
  reducer: {
    chain: chainReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 