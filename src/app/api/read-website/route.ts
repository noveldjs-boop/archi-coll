import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const result = await zai.functions.invoke('page_reader', {
      url: url
    })

    return NextResponse.json({
      success: true,
      data: {
        title: result.data.title,
        url: result.data.url,
        html: result.data.html,
        publishedTime: result.data.publishedTime,
        tokensUsed: result.data.usage?.tokens || 0
      }
    })
  } catch (error) {
    console.error('Error reading website:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to read website' 
      },
      { status: 500 }
    )
  }
}
