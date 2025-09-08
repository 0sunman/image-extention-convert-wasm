import { Nullable } from "@type";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import ConverterReducer from "./state/reducer";
import { onFileHandle, onMessage } from "./listener";

const Context = createContext<any>(null);

export default function WorkerProvider({ children }: { children: ReactNode }) {
  const workerRef = useRef<Nullable<Worker>>(null);
  const [state, dispatch] = useReducer(ConverterReducer, {
    outputUrl: "",
    processing: true,
    ext: "",
  });

  useEffect(() => {
    workerRef.current = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.postMessage({ type: "init" });
    workerRef.current.onmessage = onMessage(dispatch);
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleWorkerFile = onFileHandle({
    workerInstance: workerRef.current,
    state,
    dispatch,
  });
  return (
    <Context.Provider
      value={{
        workerRef,
        handleWorkerFile,
        isProcess: state.processing,
        outputUrl: state.outputUrl,
        ext: state.ext,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useWorker = () => {
  return useContext(Context);
};
