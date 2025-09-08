import { useWorker } from "./provider";

const Converter = () => {
  const { isProcess, outputUrl, handleWorkerFile, ext } = useWorker();
  return isProcess ? (
    <>로딩중...</>
  ) : (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <input type="file" accept="image/*" onChange={handleWorkerFile}></input>
      {outputUrl && (
        <a href={outputUrl} download={`convert.${ext}`}>
          다운로드
        </a>
      )}
    </div>
  );
};

export default Converter;
