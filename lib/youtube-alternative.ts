// Alternative approach using youtube-dl-exec (works on Vercel)
import youtubedl from "youtube-dl-exec"

export async function downloadWithYoutubeDlExec(url: string, quality: string) {
  try {
    // This approach bundles youtube-dl as a dependency
    const output = await youtubedl(url, {
      format: `best[height<=${quality.replace("p", "")}]`,
      output: "%(title)s.%(ext)s",
    })

    return {
      success: true,
      data: output,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}
