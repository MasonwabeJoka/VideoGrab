import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("file")

    if (!fileName) {
      return NextResponse.json({ error: "File name required" }, { status: 400 })
    }

    const downloadsDir = path.join(process.cwd(), "downloads")
    const filePath = path.join(downloadsDir, fileName)

    // Security check: ensure file is within downloads directory
    const resolvedPath = path.resolve(filePath)
    const resolvedDownloadsDir = path.resolve(downloadsDir)

    if (!resolvedPath.startsWith(resolvedDownloadsDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 })
    }

    try {
      const fileBuffer = await fs.readFile(filePath)
      const stats = await fs.stat(filePath)

      // Set appropriate headers for file download
      const headers = new Headers()
      headers.set("Content-Type", "application/octet-stream")
      headers.set("Content-Disposition", `attachment; filename="${fileName}"`)
      headers.set("Content-Length", stats.size.toString())

      return new NextResponse(fileBuffer, { headers })
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
