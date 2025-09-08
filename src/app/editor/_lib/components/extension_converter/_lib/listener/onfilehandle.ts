import { ACTION_SET_START_PROCESS } from "../state/action";

const onFileHandle = ({ workerInstance, state, dispatch }: any) => {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e) return;
    const file = e.target.files?.[0];
    if (!file || !workerInstance) return;

    const buf = await file.arrayBuffer();
    workerInstance.postMessage({
      type: "convert",
      buffer: buf,
      to: state.ext,
    });
    dispatch({ type: ACTION_SET_START_PROCESS });
  };
};

export default onFileHandle;
