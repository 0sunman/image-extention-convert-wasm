import {
  ACTION_SET_END_PROCESS,
  ACTION_SET_EXT,
  ACTION_SET_OUTPUT_URL,
  ACTION_SET_START_PROCESS,
} from "./action";

export type ConvertAction =
  | { type: typeof ACTION_SET_OUTPUT_URL; payload: string }
  | { type: typeof ACTION_SET_START_PROCESS }
  | { type: typeof ACTION_SET_END_PROCESS }
  | { type: typeof ACTION_SET_EXT; payload: string };

export interface ConvertState {
  outputUrl: string | null;
  processing: boolean;
  ext: string;
}

export default function ConverterReducer(
  state: ConvertState,
  action: ConvertAction
) {
  switch (action.type) {
    case ACTION_SET_OUTPUT_URL:
      return {
        ...state,
        outputUrl: action.payload,
      };
      break;
    case ACTION_SET_START_PROCESS:
      return {
        ...state,
        processing: true,
      };
      break;
    case ACTION_SET_END_PROCESS:
      return {
        ...state,
        processing: false,
      };
      break;
    case ACTION_SET_EXT:
      return {
        ...state,
        ext: action.payload,
      };
      break;
  }
  return state;
}

export const InitConverterState = {};
