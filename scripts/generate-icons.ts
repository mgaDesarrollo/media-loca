import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const svgPath = path.join(process.cwd(), 'public', 'icon.svg')
const outputDir = path.join(process.cwd(), 'public')

async function generateIcons() {
  try {
    // Read SVG
    const svgBuffer = fs.readFileSync(svgPath)

    // Generate 32x32 light icon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'icon-light-32x32.png'))
    console.log('✓ Generated icon-light-32x32.png')

    // Generate 32x32 dark icon (inverted colors)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'icon-dark-32x32.png'))
    console.log('✓ Generated icon-dark-32x32.png')

    // Generate 180x180 Apple icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-icon.png'))
    console.log('✓ Generated apple-icon.png')

    // Generate 192x192 PWA icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'pwa-icon-192.png'))
    console.log('✓ Generated pwa-icon-192.png')

    // Generate 512x512 PWA icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'pwa-icon-512.png'))
    console.log('✓ Generated pwa-icon-512.png')

    console.log('All icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

generateIcons()
