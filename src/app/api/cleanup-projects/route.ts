import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get counts before deletion for reporting
    const orderCount = await db.order.count()
    const paymentCount = await db.payment.count()
    const clientMessageCount = await db.clientMessage.count()
    const designDocCount = await db.designDocument.count()
    const progressCount = await db.projectProgress.count()
    const videoSessionCount = await db.videoSession.count()
    const inboxCount = await db.inbox.count()
    const messageCount = await db.message.count()

    // Delete all related records in order (following dependencies)
    // 1. Delete all design documents
    await db.designDocument.deleteMany({})

    // 2. Delete all video sessions
    await db.videoSession.deleteMany({})

    // 3. Delete all project progress updates
    await db.projectProgress.deleteMany({})

    // 4. Delete all client messages
    await db.clientMessage.deleteMany({})

    // 5. Delete all payments
    await db.payment.deleteMany({})

    // 6. Delete all orders
    await db.order.deleteMany({})

    // 7. Delete all inbox entries (for architect/member dashboards)
    await db.inbox.deleteMany({})

    // 8. Delete all messages (member-to-member)
    await db.message.deleteMany({})

    // 9. Reset auto-increment counter (SQLite specific)
    try {
      await db.$executeRaw`DELETE FROM sqlite_sequence WHERE name IN ('Order', 'Payment', 'ClientMessage', 'DesignDocument', 'ProjectProgress', 'VideoSession', 'Inbox', 'Message')`
    } catch (e) {
      console.log('Note: Sequence reset may not work on all SQLite versions')
    }

    return NextResponse.json({
      success: true,
      message: 'All projects and related data have been cleared successfully',
      details: {
        ordersDeleted: orderCount,
        paymentsDeleted: paymentCount,
        clientMessagesDeleted: clientMessageCount,
        designDocumentsDeleted: designDocCount,
        progressUpdatesDeleted: progressCount,
        videoSessionsDeleted: videoSessionCount,
        inboxCleared: inboxCount,
        messagesDeleted: messageCount,
        countersReset: true
      }
    })
  } catch (error) {
    console.error('Error cleaning up projects:', error)
    return NextResponse.json(
      {
        error: 'Failed to cleanup projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
