export class VideoService {
  public static readonly SUPPORTED_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  public static readonly ACCEPTED_FILE_TYPES = 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv';

  /**
   * Validates if a file is an acceptable video format.
   */
  public static isValidVideoFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    const fileName = file.name.toLowerCase();
    const hasValidExt = this.SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    const isVideoMime = file.type.startsWith('video/') || file.type === '';

    if (!hasValidExt && !isVideoMime) {
      return {
        valid: false,
        error: `Unsupported video format. Allowed formats: ${this.SUPPORTED_EXTENSIONS.join(', ')}`,
      };
    }

    // Check reasonable size threshold (e.g. 500MB max for local browser upload)
    const MAX_SIZE_BYTES = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Video file exceeds 500MB limit. Please select a smaller clip for real-time monitoring.',
      };
    }

    return { valid: true };
  }

  /**
   * Creates a local blob URL for seamless high-performance HTML5 video playback.
   */
  public static createObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Releases the blob URL to prevent memory leaks.
   */
  public static revokeObjectUrl(url: string | null): void {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('[VideoService] revokeObjectUrl failed:', e);
      }
    }
  }

  /**
   * Uploads the video file to the backend API with progress tracking.
   */
  public static async uploadVideo(
    file: File,
    apiUrl: string = 'http://localhost:8000',
    onProgress?: (percent: number) => void
  ): Promise<{ success: boolean; filename?: string; message?: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const endpoint = `${apiUrl}/api/upload`;

      xhr.open('POST', endpoint);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({ success: true, filename: response.filename, message: response.message });
          } catch {
            resolve({ success: true, message: 'Upload succeeded' });
          }
        } else {
          reject(new Error(`Server returned error status ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error connecting to backend upload server.'));
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  }
}
