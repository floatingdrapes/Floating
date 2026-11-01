import { extractGoogleDriveFileId, normalizeGoogleDriveUrl } from '../src/utils/googleDrive';

export async function handleImportImageUrl(req: any, res: any) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { url, title, category } = body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: 'Image URL or Google Drive link is required' });
    }

    const trimmedUrl = url.trim();
    const fileId = extractGoogleDriveFileId(trimmedUrl);
    const directUrl = normalizeGoogleDriveUrl(trimmedUrl);

    // Attempt to fetch the actual image bytes to generate base64 dataUrl
    // This allows the image to be permanently saved in Supabase uploaded_images table
    // even if Google later revokes or rate limits public direct views.
    let base64Data: string | null = null;
    let mimeType = 'image/jpeg';
    let sizeBytes = 0;
    let fetchSuccess = false;

    // List of candidate URLs to try fetching
    const candidateUrls: string[] = [];
    if (fileId) {
      candidateUrls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
      candidateUrls.push(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`);
      candidateUrls.push(`https://drive.google.com/uc?export=download&id=${fileId}`);
    } else {
      candidateUrls.push(trimmedUrl);
    }

    for (const testUrl of candidateUrls) {
      try {
        const response = await fetch(testUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
          },
          redirect: 'follow'
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.startsWith('image/')) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            sizeBytes = buffer.length;
            mimeType = contentType;
            base64Data = `data:${contentType};base64,${buffer.toString('base64')}`;
            fetchSuccess = true;
            break;
          }
        }
      } catch {
        // try next candidate
      }
    }

    return res.status(200).json({
      success: true,
      originalUrl: trimmedUrl,
      directUrl: directUrl,
      fileId: fileId,
      isGoogleDrive: Boolean(fileId),
      hasBase64: fetchSuccess && Boolean(base64Data),
      base64Data: base64Data || undefined,
      mimeType: mimeType,
      sizeBytes: sizeBytes,
      title: title || (fileId ? `Google Drive Photo (${fileId.substring(0, 8)})` : 'Imported Web Image'),
      category: category || 'general'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to process image URL' });
  }
}
