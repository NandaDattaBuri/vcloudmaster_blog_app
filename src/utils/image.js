// Width of an image file in pixels (null if it can't be read)
export const imageWidth = async (file) => {
  try {
    const bitmap = await createImageBitmap(file);
    const { width } = bitmap;
    bitmap.close();
    return width;
  } catch {
    return null;
  }
};

// Below these widths an image looks blurry at full article / cover size
export const MIN_CONTENT_WIDTH = 800;
export const MIN_COVER_WIDTH = 1200;

export const lowResolutionMessage = (file, width, kind) =>
  `${file.name && file.name !== 'image.png' ? file.name : 'This image'} is only ${width}px wide, so the ${kind} may look blurry. ` +
  'For best quality, upload the original file with the Image button or drag it in. Pasted images are often reduced copies.';
