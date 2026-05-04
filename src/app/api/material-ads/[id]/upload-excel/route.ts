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

    const nameIndex = getColumnIndex(['nama', 'name', 'nama produk', 'product name', 'item name', 'nama barang'])
    const codeIndex = getColumnIndex(['kode', 'code', 'sku', 'item code', 'kode barang'])
    const descriptionIndex = getColumnIndex(['deskripsi', 'description', 'deskripsi produk', 'keterangan', 'spesifikasi', 'specification'])
    const specIndex = getColumnIndex(['spesifikasi', 'specification', 'spec', 'detail', 'detail spesifikasi'])
    const unitIndex = getColumnIndex(['satuan', 'unit', 'uom', 'unit of measure'])
    const priceIndex = getColumnIndex(['harga', 'price', 'harga satuan', 'unit price'])
    const stockIndex = getColumnIndex(['stok', 'stock', 'qty', 'quantity', 'jumlah'])
    const imageIndex = getColumnIndex(['foto', 'gambar', 'image', 'photo', 'url gambar', 'image url', 'foto produk'])

    if (nameIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Missing required column: Nama/Name/Produk. Pastikan kolom nama produk ada di baris pertama Excel.' },
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
        imageUrl: imageIndex !== -1 && row[imageIndex] ? String(row[imageIndex]).trim() : null,
        materialAdId: params.id
      }

      // Combine description and specification if both exist
      if (specIndex !== -1 && row[specIndex]) {
        const spec = String(row[specIndex]).trim()
        if (product.description) {
          product.description = `${product.description}\n\nSpesifikasi: ${spec}`
        } else {
          product.description = `Spesifikasi: ${spec}`
        }
      }

      products.push(product)
    }

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid products found in Excel file. Pastikan kolom nama produk terisi.' },
        { status: 400 }
      )
    }

    // Delete existing products for this ad
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
      message: `Berhasil mengimpor ${createdProducts.count} produk`,
      imported: createdProducts.count,
      skipped: skippedCount,
      columnsFound: {
        name: nameIndex !== -1,
        code: codeIndex !== -1,
        description: descriptionIndex !== -1,
        specification: specIndex !== -1,
        unit: unitIndex !== -1,
        price: priceIndex !== -1,
        stock: stockIndex !== -1,
        image: imageIndex !== -1
      }
    })
  } catch (error) {
    console.error('Error uploading Excel:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process Excel file: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
