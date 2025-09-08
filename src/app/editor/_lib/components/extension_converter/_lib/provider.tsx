import { Nullable } from "@type";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const Context = createContext<any>(null);

export default function WorkerProvider({ children }: { children: ReactNode }) {
  const workerRef = useRef<Nullable<Worker>>(null);
  const [outputUrl, setOutputUrl] = useState<string>();
  const [isProcess, setIsProcess] = useState<boolean>(true);
  const [ext, setExt] = useState<string>("webp");

  useEffect(() => {
    workerRef.current = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.postMessage({ type: "init" });
    workerRef.current.onmessage = (e) => {
      switch (e.data.type) {
        case "loaded":
          setIsProcess(false);
          break;
        case "done":
          setOutputUrl(URL.createObjectURL(e.data.blob));
          setIsProcess(false);
          break;
        default:
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleWorkerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e) return;
    const file = e.target.files?.[0];
    if (!file || !workerRef.current) return;

    const buf = await file.arrayBuffer();
    workerRef.current.postMessage({
      type: "convert",
      buffer: buf,
      to: ext,
    });
    setIsProcess(true);
  };
  return (
    <Context.Provider
      value={{
        isProcess,
        workerRef,
        handleWorkerFile,
        outputUrl,
        setOutputUrl,
        ext,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useWorker = () => {
  return useContext(Context);
};
