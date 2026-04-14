import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'verified', 'all'
    const type = searchParams.get('type') // 'dp', 'payment_80_percent', 'payment_20_percent'

    const where: any = {}
    if (status === 'pending') {
      where.verified = false
    } else if (status === 'verified') {
      where.verified = true
    }
    if (type) {
      where.type = type
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        order: {
          include: {
            client: {
              include: {
                user: true
              }
            },
            assignedMember: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { paymentId, action, notes } = body // action: 'verify', 'reject'

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: 'Payment ID and action are required' },
        { status: 400 }
      )
    }

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (action === 'verify') {
      // Check if order was pending before verification (for inbox notification)
      const wasPending = payment.order.status === 'pending'

      // Update payment as verified
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          verified: true,
          verifiedAt: new Date(),
          notes: notes || payment.notes
        },
        include: {
          order: {
            include: {
              client: true
            }
          }
        }
      })

      // Update order payment status based on payment type
      const orderUpdates: any = {}
      if (payment.type === 'dp') {
        orderUpdates.dpPaid = true
        orderUpdates.dpPaymentDate = new Date()
        orderUpdates.paymentStage = 'dp_paid'

        // If order status is still pending, change to in_pre_design
        // This allows the order to appear in architect inbox
        if (payment.order.status === 'pending') {
          orderUpdates.status = 'in_pre_design'
        }
      } else if (payment.type === 'payment_80_percent') {
        orderUpdates.payment80PercentPaid = true
        orderUpdates.payment80Date = new Date()
        orderUpdates.paymentStage = 'payment_80_percent'
      } else if (payment.type === 'payment_20_percent') {
        orderUpdates.payment20PercentPaid = true
        orderUpdates.payment20Date = new Date()
        orderUpdates.paymentStage = 'payment_20_percent'
        orderUpdates.fullyPaid = true
      }

      const updatedOrder = await db.order.update({
        where: { id: payment.orderId },
        data: orderUpdates,
        include: {
          client: {
            include: {
              user: true
            }
          }
        }
      })

      // Create inbox notification for architects when DP is verified and order was pending
      if (payment.type === 'dp' && wasPending) {
        // Find all active architects (members with 'architect', 'licensed_architect', or 'licensed-architect' profession and status 'active')
        const architects = await db.member.findMany({
          where: {
            profession: {
              in: ['architect', 'licensed_architect', 'licensed-architect']
            },
            status: 'active'
          }
        })

        // Create inbox notifications for all architects
        if (architects.length > 0) {
          await db.inbox.createMany({
            data: architects.map(architect => ({
              memberId: architect.id,
              type: 'project',
              title: `🔥 Order Baru: ${updatedOrder.orderNumber}`,
              content: `Order baru dari klien ${updatedOrder.clientName}\n\n` +
                        `📍 Lokasi: ${updatedOrder.locationAddress || 'N/A'}\n` +
                        `🏢 Luas Bangunan: ${updatedOrder.buildingArea} m²\n` +
                        `📊 Jumlah Lantai: ${updatedOrder.buildingFloors}\n` +
                        `💰 Design Fee: Rp ${updatedOrder.designFee.toLocaleString('id-ID')}\n\n` +
                        `Status: Menunggu Assignment`,
              link: `/architect/dashboard`
            }))
          })
        }
      }

      return NextResponse.json({ payment: updatedPayment, order: updatedOrder })
    } else if (action === 'reject') {
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          notes: notes || payment.notes
        }
      })

      return NextResponse.json({ payment: updatedPayment })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
