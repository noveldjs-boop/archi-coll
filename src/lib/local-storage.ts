// File: src/lib/local-storage.ts
// Ini adalah solusi sementara untuk mengatasi error build.
// TODO: Ganti fungsi-fungsi ini dengan logika penyimpanan riil di Supabase nantinya.

export async function saveToLocalStorage(file: File, path: string): Promise<string> {
  console.warn("Local storage is deprecated. Please use Supabase Storage.");
  // Mengembalikan URL palsu untuk sementara.
  return `/temp/${path}`;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function getPublicUrl(path: string): string {
  console.warn("Local storage is deprecated. Returning fake URL.");
  return `/temp/${path}`;
}

export async function deleteLocalFile(path: string): Promise<void> {
  console.warn(`Local storage is deprecated. Cannot delete file: ${path}`);
}