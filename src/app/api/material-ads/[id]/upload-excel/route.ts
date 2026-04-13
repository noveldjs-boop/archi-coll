import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as XLSX from 'xlsx'

// POST - Upload Excel file and create product items
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authorization - hanya admin/marketing yang bisa upload
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MARKETING')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if ad exists
    const ad = await db.materialAd.findUnique({
      where: { id: params.id }
    })

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      )
    }

    // Read file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get first sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (jsonData.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Excel file is empty or missing data' },
        { status: 400 }
      )
    }

    // Parse headers (first row)
    const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim())

    // Expected column mappings
    const getColumnIndex = (possibleNames: string[]) => {
      return headers.findIndex(h => possibleNames.some(name => h.includes(name)))
    }

    const nameIndex = getColumnIndex(['nama', 'name', 'nama produk', 'product name', 'item name'])
    const codeIndex = getColumnIndex(['kode', 'code', 'sku', 'item code'])
    const descriptionIndex = getColumnIndex(['deskripsi', 'description', 'deskripsi produk'])
    const unitIndex = getColumnIndex(['satuan', 'unit', 'uom'])
    const priceIndex = getColumnIndex(['harga', 'price', 'harga satuan'])
    const stockIndex = getColumnIndex(['stok', 'stock', 'qty', 'quantity'])

    if (nameIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Missing required column: Nama/Name' },
        { status: 400 }
      )
    }

    // Parse data rows
    const products = []
    let skippedCount = 0

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]
      const itemName = row[nameIndex]

      // Skip empty rows
      if (!itemName || String(itemName).trim() === '') {
        skippedCount++
        continue
      }

      const product: any = {
        itemName: String(itemName).trim(),
        itemCode: codeIndex !== -1 && row[codeIndex] ? String(row[codeIndex]).trim() : null,
        description: descriptionIndex !== -1 && row[descriptionIndex] ? String(row[descriptionIndex]).trim() : null,
        unit: unitIndex !== -1 && row[unitIndex] ? String(row[unitIndex]).trim() : null,
        price: priceIndex !== -1 && row[priceIndex] ? parseFloat(String(row[priceIndex])) || null : null,
        stock: stockIndex !== -1 && row[stockIndex] ? parseInt(String(row[stockIndex])) || null : null,
        materialAdId: params.id
      }

      products.push(product)
    }

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid products found in Excel file' },
        { status: 400 }
      )
    }

    // Delete existing products for this ad (optional - remove if you want to append)
    await db.productItem.deleteMany({
      where: { materialAdId: params.id }
    })

    // Create products in database
    const createdProducts = await db.productItem.createMany({
      data: products,
      skipDuplicates: true
    })

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${createdProducts.count} products`,
      imported: createdProducts.count,
      skipped: skippedCount
    })
  } catch (error) {
    console.error('Error uploading Excel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process Excel file' },
      { status: 500 }
    )
  }
}
