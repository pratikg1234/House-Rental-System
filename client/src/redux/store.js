import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

//here we have added userReducer which we have created inside userSlice
const rootReducer = combineReducers({ user: userReducer });

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

//this will config store
export const store = configureStore({
  //here we are adding persistedReducer to the store
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>//for preventing any error in the browser
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
