import Converter from "./_lib/converter";
import WorkerProvider from "./_lib/provider";

const ExtensionConverter = () => {
  return (
    <WorkerProvider>
      <Converter />
    </WorkerProvider>
  );
};

export default ExtensionConverter;
