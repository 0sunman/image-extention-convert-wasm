import { ACTION_SET_END_PROCESS, ACTION_SET_OUTPUT_URL } from "../state/action";

export default function onMessage(dispatch: any) {
  return (e: any) => {
    switch (e.data.type) {
      case "loaded":
        dispatch({ type: ACTION_SET_END_PROCESS });
        break;
      case "done":
        dispatch({
          type: ACTION_SET_OUTPUT_URL,
          payload: URL.createObjectURL(e.data.blob),
        });
        dispatch({ type: ACTION_SET_END_PROCESS });
        break;
      default:
    }
  };
}
