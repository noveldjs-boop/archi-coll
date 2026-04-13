/**
 * Order Service
 * Business logic untuk order operations
 */

import { db } from '@/lib/db'
import type { Order, Payment, DesignDocument } from '@/types'

export const orderService = {
  // Create order
  async createOrder(data: {
    clientId: string
    clientName: string
    clientPhone: string
    clientAddress: string
    clientProfession: string
    clientCompanyName?: string
    landArea: string
    landPosition: string
    landBoundary?: string
    accessRoadWidth?: string
    buildingArea: string
    buildingModel: string
    buildingFloors: string
    structureType: string
    buildingCategory: string
    buildingType?: string
    qualityLevel?: string
    description?: string
    location?: string
    coordinates?: string
    rab: number
    designFee: number
    iaiFeeRate: number
    pricePerM2: number
    simulatedDP10: number
  }) {
    // Generate order number
    const orderCount = await db.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`

    return await db.order.create({
      data: {
        ...data,
        orderNumber,
        status: 'pending',
        dpPaid: false,
        designAgreed: false,
        payment80PercentPaid: false,
        payment20PercentPaid: false,
        fullyPaid: false,
      },
    })
  },

  // Get order
  async getOrderById(id: string) {
    return await db.order.findUnique({
      where: { id },
      include: {
        payments: true,
        designDocuments: true,
        assignedMember: true,
        client: true,
      },
    })
  },

  async getOrderByNumber(orderNumber: string) {
    return await db.order.findUnique({
      where: { orderNumber },
      include: {
        payments: true,
        designDocuments: true,
        assignedMember: true,
        client: true,
      },
    })
  },

  // Get orders by client
  async getOrdersByClient(clientId: string) {
    return await db.order.findMany({
      where: { clientId },
      include: {
        payments: true,
        designDocuments: true,
        assignedMember: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status']) {
    return await db.order.update({
      where: { id },
      data: { status },
    })
  },

  // Update payment stage
  async updatePaymentStage(
    id: string,
    stage: 'pending' | 'dp_paid' | 'design_agreed' | 'payment_80_percent' | 'payment_20_percent' | 'completed',
    updates: {
      dpPaid?: boolean
      dpPaymentDate?: string
      agreedDesignFee?: number
      agreedDesignFeeDate?: string
      payment80PercentPaid?: boolean
      payment80Date?: string
      payment20PercentPaid?: boolean
      payment20Date?: string
      fullyPaid?: boolean
      completedAt?: string
    }
  ) {
    return await db.order.update({
      where: { id },
      data: {
        paymentStage: stage,
        ...updates,
        ...(stage === 'completed' ? { status: 'completed', completedAt: new Date().toISOString() } : {}),
      },
    })
  },

  // Assign member to order
  async assignMember(orderId: string, memberId: string) {
    return await db.order.update({
      where: { id: orderId },
      data: {
        assignedMemberId: memberId,
        assignedAt: new Date().toISOString(),
      },
    })
  },

  // Add payment
  async addPayment(data: {
    orderId: string
    type: 'dp' | 'payment_80_percent' | 'payment_20_percent'
    amount: number
    paymentMethod?: string
    proofUrl?: string
  }) {
    return await db.payment.create({
      data: {
        ...data,
        verified: false,
      },
    })
  },

  // Verify payment
  async verifyPayment(id: string, verifiedBy: string) {
    const payment = await db.payment.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy,
      },
    })

    // Update order payment stage if needed
    if (payment.verified) {
      const order = await this.getOrderById(payment.orderId)
      if (!order) return payment

      let updates = {}
      let newStage = order.paymentStage

      if (payment.type === 'dp' && !order.dpPaid) {
        updates = { dpPaid: true, dpPaymentDate: new Date().toISOString() }
        newStage = 'dp_paid'
      } else if (payment.type === 'payment_80_percent' && !order.payment80PercentPaid) {
        updates = { payment80PercentPaid: true, payment80Date: new Date().toISOString() }
        newStage = 'payment_80_percent'
      } else if (payment.type === 'payment_20_percent' && !order.payment20PercentPaid) {
        updates = { payment20PercentPaid: true, payment20Date: new Date().toISOString(), fullyPaid: true }
        newStage = 'completed'
      }

      if (Object.keys(updates).length > 0) {
        await this.updatePaymentStage(order.id, newStage, updates as any)
      }
    }

    return payment
  },

  // Add design document
  async addDesignDocument(data: {
    orderId: string
    documentType: 'pre_design' | 'schematic' | 'ded' | 'as_build'
    title: string
    description?: string
    fileUrl: string
  }) {
    return await db.designDocument.create({
      data: {
        ...data,
        deliveredAt: new Date().toISOString(),
      },
    })
  },

  // Get order statistics
  async getOrderStats() {
    const [total, pending, inProgress, completed] = await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: 'pending' } }),
      db.order.count({
        where: {
          status: {
            in: ['in_pre_design', 'in_schematic', 'in_ded', 'in_review'],
          },
        },
      }),
      db.order.count({ where: { status: 'completed' } }),
    ])

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  },
}
