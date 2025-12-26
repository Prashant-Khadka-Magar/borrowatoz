"use client";

import { useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import globalReducer from "./index";
import authReducer from "./authSlice";
import { api } from "./api";

const rootReducer = combineReducers({
  global: globalReducer,
  auth: authReducer,
  [api.reducerPath]: api.reducer,
});

const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });

// convenience hooks (JS)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export function StoreProvider({ children }) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}


