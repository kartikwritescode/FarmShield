/**
 * QR Passport Service
 * Client-side utility mirroring backend qrService.ts and Flutter animal_passport_controller.dart
 * Handles verification URL generation, QR Data URL creation, and printable ear-tag PNG rendering
 */

import QRCode from 'qrcode';

export interface PrintableEarTagOptions {
  animalCode: string;
  qrToken: string;
  breed?: string;
  species: string;
  farmName?: string;
  isSafe: boolean;
  complianceScore?: number;
}

export class QrPassportService {
  /**
   * Generates public verification URL
   */
  public static getVerificationUrl(qrToken: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://farmshield.in';
    return `${origin}/qr/${encodeURIComponent(qrToken)}`;
  }

  /**
   * Generates a Base64 QR Data URL for an animal
   */
  public static async generateQRDataUrl(qrToken: string): Promise<string> {
    const url = this.getVerificationUrl(qrToken);
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#134E4A', // Teal-900 for FarmShield Branding
        light: '#FFFFFF',
      },
    });
  }

  /**
   * Generates a high-resolution printable ear-tag badge as PNG Data URL
   */
  public static async generatePrintableEarTagBadge(options: PrintableEarTagOptions): Promise<string> {
    const qrDataUrl = await this.generateQRDataUrl(options.qrToken);

    // Create an offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // 1. Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Outer Border (Green / Teal for food safety)
    ctx.strokeStyle = options.isSafe ? '#0D9488' : '#E11D48';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // 3. Header Bar
    ctx.fillStyle = options.isSafe ? '#0F766E' : '#9F1239';
    ctx.fillRect(17, 17, canvas.width - 34, 110);

    // Header Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FARMSHIELD • NATIONAL TRACEABILITY', canvas.width / 2, 60);

    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FSSAI MRL DIGITAL PASSPORT & EAR TAG', canvas.width / 2, 95);

    // 4. Animal Code Big Title
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(options.animalCode, canvas.width / 2, 175);

    // Breed & Species subtitle
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px sans-serif';
    const speciesLabel = options.species.toUpperCase();
    const breedLabel = options.breed ? `(${options.breed})` : '';
    ctx.fillText(`${speciesLabel} ${breedLabel}`, canvas.width / 2, 205);

    // 5. Draw QR Code Image in Center
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });

    const qrSize = 340;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = 230;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // 6. Food Safety Clearance Banner under QR
    ctx.fillStyle = options.isSafe ? '#ECFDF5' : '#FFF1F2';
    ctx.fillRect(40, 595, canvas.width - 80, 55);
    ctx.strokeStyle = options.isSafe ? '#10B981' : '#F43F5E';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 595, canvas.width - 80, 55);

    ctx.fillStyle = options.isSafe ? '#065F46' : '#9F1239';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(
      options.isSafe
        ? '✓ CLEARED: ZERO MRL RESIDUE'
        : '⚠️ STATUTORY WITHHOLDING EMBARGO',
      canvas.width / 2,
      630
    );

    // 7. Footer Farm & Scan instructions
    ctx.fillStyle = '#64748B';
    ctx.font = '13px sans-serif';
    ctx.fillText(
      options.farmName ? `Farm: ${options.farmName}` : 'Digital Farm Food Safety Standards',
      canvas.width / 2,
      685
    );
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SCAN WITH CAMERA OR FARMSHIELD SCANNER TO VERIFY MILK SAFETY', canvas.width / 2, 715);

    return canvas.toDataURL('image/png');
  }

  /**
   * Triggers browser download of the printable ear-tag PNG
   */
  public static async downloadEarTagBadge(options: PrintableEarTagOptions): Promise<void> {
    const pngDataUrl = await this.generatePrintableEarTagBadge(options);
    const link = document.createElement('a');
    link.href = pngDataUrl;
    link.download = `EarTag_${options.animalCode.replace(/[^a-zA-Z0-9_-]/g, '_')}_MRL.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
