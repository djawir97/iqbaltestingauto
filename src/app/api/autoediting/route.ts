import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Helper function to format duration
    const formatDuration = (seconds: number): string => {
      if (seconds === 0) return '0 detik';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      if (minutes > 0) {
        return remainingSeconds > 0 
          ? `${minutes} menit ${remainingSeconds} detik`
          : `${minutes} menit`;
      }
      return `${remainingSeconds} detik`;
    };
    
    // Get webhook URL
    const webhookUrl = formData.get('webhookUrl') as string;
    
    // Get user info
    const userId = formData.get('userId') as string;
    const platform = formData.get('platform') as string || 'tiktok';
    
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get files
    const backgroundVideo = formData.get('backgroundVideo') as File;
    const frame = formData.get('frame') as File | null;
    const avatarAI = formData.get('avatarAI') as File | null;
    const promoFootage = formData.get('promoFootage') as File | null;
    
    // Get text dubbing fields
    const textDubbingVideo = formData.get('textDubbingVideo') as string | null;
    const textDubbingPromoVideo = formData.get('textDubbingPromoVideo') as string | null;

    if (!backgroundVideo) {
      return NextResponse.json(
        { error: 'Background video is required' },
        { status: 400 }
      );
    }

    // Convert files to base64
    const fileToBase64 = async (file: File): Promise<string> => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return buffer.toString('base64');
    };

    // Build structured payload based on filled columns
    const payload: any = {
      timestamp: new Date().toISOString(),
      requestInfo: {
        source: 'AutoEditing-Web',
        version: '1.0',
        webhookUrl: webhookUrl
      },
      userInfo: {
        platform: platform,
        userId: userId,
        timestamp: new Date().toISOString()
      },
      files: {
        backgroundVideo: {
          name: backgroundVideo.name,
          type: backgroundVideo.type,
          size: backgroundVideo.size,
          sizeMB: (backgroundVideo.size / (1024 * 1024)).toFixed(2),
          data: await fileToBase64(backgroundVideo),
          category: 'video',
          required: true
        }
      },
      textDubbing: {},
      metadata: {
        totalFiles: 1,
        hasFrame: false,
        hasAvatarAI: false,
        hasPromoFootage: false,
        hasTextDubbingVideo: false,
        hasTextDubbingPromoVideo: false,
        submittedColumns: ['backgroundVideo']
      }
    };

    // Add optional files only if they exist
    if (frame) {
      payload.files.frame = {
        name: frame.name,
        type: frame.type,
        size: frame.size,
        sizeMB: (frame.size / (1024 * 1024)).toFixed(2),
        data: await fileToBase64(frame),
        category: 'image',
        required: false
      };
      payload.metadata.totalFiles++;
      payload.metadata.hasFrame = true;
      payload.metadata.submittedColumns.push('frame');
    }

    if (avatarAI) {
      payload.files.avatarAI = {
        name: avatarAI.name,
        type: avatarAI.type,
        size: avatarAI.size,
        sizeMB: (avatarAI.size / (1024 * 1024)).toFixed(2),
        data: await fileToBase64(avatarAI),
        category: 'image',
        required: false
      };
      payload.metadata.totalFiles++;
      payload.metadata.hasAvatarAI = true;
      payload.metadata.submittedColumns.push('avatarAI');
    }

    if (promoFootage) {
      payload.files.promoFootage = {
        name: promoFootage.name,
        type: promoFootage.type,
        size: promoFootage.size,
        sizeMB: (promoFootage.size / (1024 * 1024)).toFixed(2),
        data: await fileToBase64(promoFootage),
        category: 'video',
        required: false
      };
      payload.metadata.totalFiles++;
      payload.metadata.hasPromoFootage = true;
      payload.metadata.submittedColumns.push('promoFootage');
    }

    // Add text dubbing fields only if they exist
    if (textDubbingVideo && textDubbingVideo.trim()) {
      const videoWords = textDubbingVideo.trim().split(/\s+/).length;
      const videoDuration = Math.ceil(videoWords * (60 / 150)); // 150 words per minute
      
      payload.textDubbing.video = {
        text: textDubbingVideo.trim(),
        length: textDubbingVideo.length,
        words: videoWords,
        estimatedDurationSeconds: videoDuration,
        estimatedDurationFormatted: formatDuration(videoDuration),
        type: 'video_dubbing'
      };
      payload.metadata.hasTextDubbingVideo = true;
      payload.metadata.submittedColumns.push('textDubbingVideo');
    }

    if (textDubbingPromoVideo && textDubbingPromoVideo.trim()) {
      const promoWords = textDubbingPromoVideo.trim().split(/\s+/).length;
      const promoDuration = Math.ceil(promoWords * (60 / 150)); // 150 words per minute
      
      payload.textDubbing.promoVideo = {
        text: textDubbingPromoVideo.trim(),
        length: textDubbingPromoVideo.length,
        words: promoWords,
        estimatedDurationSeconds: promoDuration,
        estimatedDurationFormatted: formatDuration(promoDuration),
        type: 'promo_video_dubbing'
      };
      payload.metadata.hasTextDubbingPromoVideo = true;
      payload.metadata.submittedColumns.push('textDubbingPromoVideo');
    }

    // Add total duration summary if any text dubbing exists
    if (payload.textDubbing.video || payload.textDubbing.promoVideo) {
      const totalDuration = (payload.textDubbing.video?.estimatedDurationSeconds || 0) + 
                           (payload.textDubbing.promoVideo?.estimatedDurationSeconds || 0);
      const totalWords = (payload.textDubbing.video?.words || 0) + 
                        (payload.textDubbing.promoVideo?.words || 0);
      
      payload.textDubbing.summary = {
        totalWords: totalWords,
        totalDurationSeconds: totalDuration,
        totalDurationFormatted: formatDuration(totalDuration),
        readingSpeedWPM: 150
      };
    }

    // Add file summary for easy processing
    payload.fileSummary = {
      videos: payload.metadata.totalFiles - (payload.metadata.hasFrame ? 1 : 0) - (payload.metadata.hasAvatarAI ? 1 : 0),
      images: (payload.metadata.hasFrame ? 1 : 0) + (payload.metadata.hasAvatarAI ? 1 : 0),
      requiredFiles: 1,
      optionalFiles: payload.metadata.totalFiles - 1
    };

    // Log untuk debugging
    console.log('Sending to webhook:', {
      url: webhookUrl,
      filesCount: payload.metadata.totalFiles,
      columns: payload.metadata.submittedColumns,
      fileTypes: Object.keys(payload.files)
    });

    // Send to webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AutoEditing-Web/1.0',
          'X-File-Count': payload.metadata.totalFiles.toString(),
          'X-Submitted-Columns': payload.metadata.submittedColumns.join(',')
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        return NextResponse.json(
          { 
            error: 'Webhook failed',
            status: webhookResponse.status,
            details: errorText,
            payload: {
              filesCount: payload.metadata.totalFiles,
              submittedColumns: payload.metadata.submittedColumns
            }
          },
          { status: 500 }
        );
      }

      const webhookResult = await webhookResponse.json();

      return NextResponse.json({
        success: true,
        message: 'Files sent successfully',
        payload: {
          filesCount: payload.metadata.totalFiles,
          submittedColumns: payload.metadata.submittedColumns,
          fileSummary: payload.fileSummary,
          files: {
            backgroundVideo: backgroundVideo.name,
            frame: frame?.name || null,
            avatarAI: avatarAI?.name || null,
            promoFootage: promoFootage?.name || null,
          },
          textDubbing: {
            video: textDubbingVideo?.trim() || null,
            promoVideo: textDubbingPromoVideo?.trim() || null,
            summary: payload.textDubbing.summary || null
          }
        },
        webhookResponse: {
          status: webhookResponse.status,
          data: webhookResult
        }
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}