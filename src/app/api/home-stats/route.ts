import { NextResponse } from "next/server"
import db from "@/lib/db"

// Get all active home stats for display on home page
export async function GET() {
  try {
    const stats = await db.homeStats.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })

    // Check if we need dynamic calculations
    const needsDynamicCalc = stats.some(s => s.dataSource === 'dynamic')
    
    if (!needsDynamicCalc) {
      // No dynamic calculations needed, return stats as-is
      return NextResponse.json(stats)
    }

    // Only do DB queries if needed
    const statsWithValues = await Promise.all(
      stats.map(async (stat) => {
        let calculatedValue = stat.value

        // Calculate dynamic values based on data source
        if (stat.dataSource === 'dynamic') {
          switch (stat.key) {
            case 'projects':
              // Count completed projects - with error handling
              try {
                const projectCount = await db.portfolioProject.count({
                  where: { active: true }
                })
                calculatedValue = `${projectCount}+`
              } catch {
                calculatedValue = stat.value // Use default if query fails
              }
              break

            case 'members':
              // Count active members - with error handling
              try {
                const memberCount = await db.member.count({
                  where: { status: 'active' }
                })
                calculatedValue = `${memberCount}+`
              } catch {
                calculatedValue = stat.value // Use default if query fails
              }
              break

            case 'clients':
              // Count unique clients from construction projects - with error handling
              try {
                const projects = await db.constructionProject.findMany({
                  where: {
                    clientName: { not: null }
                  },
                  select: { clientName: true },
                  take: 100 // Limit to prevent memory issues
                })
                const uniqueClients = new Set(projects.map(p => p.clientName).filter(Boolean)).size
                calculatedValue = `${uniqueClients}+`
              } catch {
                calculatedValue = stat.value // Use default if query fails
              }
              break

            // Keep default value for other dynamic keys that haven't been implemented
            default:
              break
          }
        }

        return {
          ...stat,
          value: calculatedValue
        }
      })
    )

    return NextResponse.json(statsWithValues)
  } catch (error) {
    console.error("Error fetching home stats:", error)
    // Return empty array instead of error to prevent page from hanging
    return NextResponse.json([])
  }
}
