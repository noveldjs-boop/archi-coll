import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('ARCHI-COLL Test Page - Server is working!', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
