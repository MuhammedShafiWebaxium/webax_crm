import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import loadingReducer from './loadingSlice';
import alertReducer from './alertSlice';
import userReducer from './userSlice';
import companyReducer from './companySlice';
import todoReducer from './todoSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const reducer = combineReducers({
  loading: loadingReducer,
  alert: alertReducer,
  user: userReducer,
  company: companyReducer,
  todo: todoReducer,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // ✅ Ignore redux-persist actions
      },
    }),
});

export const persistor = persistStore(store);

// persistor.purge();