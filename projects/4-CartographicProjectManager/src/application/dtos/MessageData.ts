/**
 * Message creation data DTO
 */
export interface MessageData {
  projectId: string;
  senderId: string;
  content: string;
  fileIds?: string[];
}
