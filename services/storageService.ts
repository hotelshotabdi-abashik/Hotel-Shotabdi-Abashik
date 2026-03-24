
const WORKER_URL = 'https://shotabdi-abashik.hotelshotabdiabashik.workers.dev';
const PUBLIC_URL = 'https://pub-9f3e455c1df04b5b98df165c6987ccca.r2.dev';

/**
 * Storage Service for Hotel Shotabdi Residential
 * Interacts with Cloudflare R2 via a custom Worker.
 */
export const storageService = {
  /**
   * Uploads a file to Cloudflare R2 via the Worker.
   * @param file The file to upload
   * @param customName Optional custom name for the file
   * @returns The public URL of the uploaded file
   */
  async uploadImage(file: File, customName?: string): Promise<string> {
    const fileName = customName || `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadUrl = `${WORKER_URL}/${fileName}`;

    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      // Return the public URL
      return `${PUBLIC_URL}/${fileName}`;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw error;
    }
  },

  /**
   * Deletes a file from Cloudflare R2 via the Worker.
   * @param url The public URL of the file to delete
   */
  async deleteImage(url: string): Promise<void> {
    if (!url.startsWith(PUBLIC_URL)) {
      console.warn('Attempted to delete a non-R2 URL:', url);
      return;
    }

    const fileName = url.replace(`${PUBLIC_URL}/`, '');
    const deleteUrl = `${WORKER_URL}/${fileName}`;

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting from R2:', error);
      throw error;
    }
  }
};
