/* eslint-env node */
/* global console, fetch */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'node:fs'
import process from 'node:process'

const REGION = process.env.AWS_REGION
const BUCKET = process.env.S3_BUCKET_APP_DOCUMENTS
const FILE_PATH = './test-upload.txt'
const KEY = `tests/${Date.now()}-test-upload.txt`

const client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

async function main() {
  fs.writeFileSync(FILE_PATH, 'Hello from presigned upload test')

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: KEY,
    ContentType: 'text/plain'
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 })
  console.warn('Presigned URL:', uploadUrl)

  // Simple upload using fetch (Node 18+)
  const fileBuffer = fs.readFileSync(FILE_PATH)
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'text/plain' },
    body: fileBuffer
  })

  console.warn('Status:', res.status, res.statusText)
}

main().catch(console.error)
