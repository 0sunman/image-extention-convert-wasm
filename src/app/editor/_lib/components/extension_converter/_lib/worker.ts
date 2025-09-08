import {
  ImageMagick,
  initializeImageMagick,
  MagickFormat,
} from "@imagemagick/magick-wasm";

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
        readImage({ byteArray })
          .then(convertExt({ ext: e.data.to }))
          .then((blob) => {
            self.postMessage({
              type: "done",
              format: e.data.to.toUpperCase(),
              blob, // transferable 불가 → main에서 URL.createObjectURL(blob) 해도 됨
            });
          });
      } catch (err) {
        self.postMessage({ type: "error", message: err?.toString() });
      }
  }
};

function readImage({
  byteArray,
}: {
  byteArray: Uint8Array;
}): Promise<Uint8Array<ArrayBufferLike>> {
  return new Promise((resolve, reject) => {
    try {
      console.log("input length:", byteArray.length); // 디버그
      console.log("input head:", byteArray.slice(0, 16)); // 파일 헤더 확인

      ImageMagick.read(byteArray, (image) => {
        if (image.width === 0 || image.height === 0) {
          reject("Image failed to load (empty dimensions)");
        } else {
          // 복제본을 resolve → 원본 스코프와 분리됨
          image.dispose();
          resolve(byteArray);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function convertExt({ ext }: { ext: string }) {
  return (byteArray: Uint8Array<ArrayBufferLike>) =>
    new Promise((resolve, reject) => {
      try {
        ImageMagick.read(byteArray, (image) => {
          image.write(ext.toUpperCase() as MagickFormat, (image_result) => {
            const blob = new Blob([new Uint8Array(image_result)], {
              type: `image/${ext.toLowerCase()}`,
            });
            image.dispose();
            resolve(blob);
          });
        });
      } catch (err) {
        reject(err);
      }
    });
}
