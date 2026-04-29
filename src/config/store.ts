import keplerGlReducer, { enhanceReduxMiddleware, mapStyleUpdaters } from "@kepler.gl/reducers";
import {
  applyMiddleware,
  configureStore,
  ThunkAction,
  UnknownAction,
} from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// import {taskMiddleware} from 'react-palm/tasks';

const reducer = combineReducers({
  keplerGl: keplerGlReducer.initialState({
    uiState: {
      currentModal: null,
    },
    mapStyle: {
      ...mapStyleUpdaters.INITIAL_MAP_STYLE,
      styleType: "voyager"
    }
  }),
});

const middleWares = enhanceReduxMiddleware([
  // Add other middlewares here
]);
// @ts-expect-error middleware type
const enhancers = [applyMiddleware(...middleWares)];

const store = (preloadedState?: Partial<IRootState>) =>
  configureStore({
    reducer: reducer,
    preloadedState,
    devTools: !import.meta.env.PROD,
    enhancers: (getDefaultEnhancers) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getDefaultEnhancers().concat(enhancers as any),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).concat([
        // taskMiddleware,
      ]),
  });

const getStore = (preloadedState?: Partial<IRootState>) =>
  store(preloadedState);

export type IRootState = ReturnType<typeof reducer>;
export type AppStore = ReturnType<typeof getStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  IRootState,
  unknown,
  UnknownAction
>;

export default getStore;
