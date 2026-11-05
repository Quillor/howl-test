// Gets a photo ready to post: turns it the right way up, shrinks it to at most 1600px wide or tall,
// and saves it as a JPEG, so phone photos upload fast.
const MAX_SIDE = 1600
export const MAX_FILE_MB = 20

export async function preparePhoto(file) {
  if (!file.type.startsWith('image/')) throw new Error('not-image')
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error('too-big')
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('unreadable')
  })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  return { blob, width, height, previewUrl: URL.createObjectURL(blob) }
}

export const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
