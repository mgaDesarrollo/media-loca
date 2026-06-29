
export async function GET(request: Request) {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
  const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN
    ? process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20) + '...'
    : null

  return Response.json({
    hasBlobToken,
    tokenPrefix,
    blobStoreId: process.env.BLOB_STORE_ID ?? null,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV ?? 'not set',
    vercelRegion: process.env.VERCEL_REGION ?? 'not set',
  })
}
