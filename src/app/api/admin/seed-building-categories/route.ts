import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Seed initial building categories
export async function POST(req: NextRequest) {
  try {
    const categories = [
      {
        categoryId: 'residential',
        labelIndo: 'Rumah Tinggal',
        labelEng: 'Residential',
        descriptionIndo: 'Desain rumah tinggal modern dan nyaman untuk keluarga Anda',
        descriptionEng: 'Modern and comfortable residential home designs for your family',
        icon: 'Home',
        order: 1,
        active: true,
      },
      {
        categoryId: 'apartment',
        labelIndo: 'Apartment',
        labelEng: 'Apartment',
        descriptionIndo: 'Desain apartemen hunian dan komersial yang modern',
        descriptionEng: 'Modern residential and commercial apartment designs',
        icon: 'Building',
        order: 2,
        active: true,
      },
      {
        categoryId: 'hotel',
        labelIndo: 'Hotel',
        labelEng: 'Hotel',
        descriptionIndo: 'Desain hotel dan resort yang mewah dan berkelas',
        descriptionEng: 'Luxury and classy hotel and resort designs',
        icon: 'Building2',
        order: 3,
        active: true,
      },
      {
        categoryId: 'commercial',
        labelIndo: 'Komersial',
        labelEng: 'Commercial',
        descriptionIndo: 'Desain bangunan komersial untuk bisnis dan retail',
        descriptionEng: 'Commercial building designs for business and retail',
        icon: 'Briefcase',
        order: 4,
        active: true,
      },
      {
        categoryId: 'villa',
        labelIndo: 'Villa',
        labelEng: 'Villa',
        descriptionIndo: 'Desain villa mewah dengan nuansa tropis dan modern',
        descriptionEng: 'Luxury villa designs with tropical and modern vibes',
        icon: 'Building',
        order: 5,
        active: true,
      },
      {
        categoryId: 'cafe_restaurant',
        labelIndo: 'Cafe & Restoran',
        labelEng: 'Cafe & Restaurant',
        descriptionIndo: 'Desain interior dan eksterior cafe serta restoran yang menarik',
        descriptionEng: 'Attractive interior and exterior designs for cafes and restaurants',
        icon: 'Utensils',
        order: 6,
        active: true,
      },
    ];

    const results: { action: string; data: any }[] = [];

    for (const category of categories) {
      const existing = await db.buildingCategory.findUnique({
        where: { categoryId: category.categoryId },
      });

      if (!existing) {
        const created = await db.buildingCategory.create({
          data: category,
        });
        results.push({ action: 'created', data: created });
      } else {
        const updated = await db.buildingCategory.update({
          where: { categoryId: category.categoryId },
          data: category,
        });
        results.push({ action: 'updated', data: updated });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Building categories seeded successfully',
      results,
    });
  } catch (error) {
    console.error('Error seeding building categories:', error);
    return NextResponse.json({ error: 'Failed to seed building categories' }, { status: 500 });
  }
}
