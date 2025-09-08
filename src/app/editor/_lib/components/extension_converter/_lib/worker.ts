import { ImageMagick, initializeImageMagick } from "@imagemagick/magick-wasm";

let ready = false;

async function init() {
  const res = await fetch("/wasm/magick.wasm");
  const buf = await res.arrayBuffer();
  await initializeImageMagick(buf);
  ready = true;
}
self.onmessage = (e) => {
  console.log(e);
  switch (e.data.type) {
    case "init":
      init();
      self.postMessage({
        type: "loaded",
      });
      break;
    case "convert":
      if (!ready) {
        self.postMessage({
          type: "error",
          message: "Not loaded",
        });
        return;
      }
      const buffer = new Uint8Array(e.data.buffer);

      try {
        const byteArray = new Uint8Array(buffer);

        ImageMagick.read(byteArray, (image) => {
          image.quality = 80; // JPEG/WebP면 압축률 적용됨

          image.write(e.data.to.toUpperCase(), (image_result) => {
            const blob = new Blob([new Uint8Array(image_result)], {
              type: `image/${e.data.to.toLowerCase()}`,
            });

            self.postMessage({
              type: "done",
              format: e.data.to.toUpperCase(),
              blob, // transferable 불가 → main에서 URL.createObjectURL(blob) 해도 됨
            });
          });
        });
      } catch (err) {
        self.postMessage({ type: "error", message: err?.toString() });
      }
  }
};
