import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { prompt, filename } = await request.json()

    if (!prompt || !filename) {
      return NextResponse.json(
        { error: 'Prompt and filename are required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1344x768' // Landscape size for portfolio images
    })

    const imageBase64 = response.data[0].base64
    const buffer = Buffer.from(imageBase64, 'base64')

    // Save to upload folder
    const uploadDir = path.join(process.cwd(), 'upload')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filepath = path.join(uploadDir, filename)
    fs.writeFileSync(filepath, buffer)

    return NextResponse.json({
      success: true,
      filename: filename,
      path: `/api/images/${filename}`
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
