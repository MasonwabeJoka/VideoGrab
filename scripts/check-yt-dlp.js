const { spawn } = require("child_process")

function checkYtDlp() {
  console.log("Checking for yt-dlp installation...")

  const ytDlp = spawn("yt-dlp", ["--version"], { stdio: "pipe" })

  ytDlp.on("close", (code) => {
    if (code === 0) {
      console.log("✅ yt-dlp is installed and ready!")
    } else {
      console.log("❌ yt-dlp not found. Please install it:")
      console.log("")
      console.log("macOS/Linux:")
      console.log("  pip install yt-dlp")
      console.log("  # or")
      console.log("  brew install yt-dlp")
      console.log("")
      console.log("Windows:")
      console.log("  pip install yt-dlp")
      console.log("  # or download from: https://github.com/yt-dlp/yt-dlp/releases")
      console.log("")
    }
  })

  ytDlp.on("error", () => {
    console.log("❌ yt-dlp not found. Please install it first.")
  })
}

checkYtDlp()
