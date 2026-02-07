/**
 * @module application/dto/message-data
 * @description Data Transfer Object for message creation.
 * @category Application
 */

/**
 * Data required to send a new message.
 */
export interface MessageData {
  /** ID of the project this message belongs to. */
  projectId: string;
  /** ID of the user sending the message. */
  senderId: string;
  /** Text content of the message. */
  content: string;
  /** Optional list of file IDs to attach. */
  fileIds?: string[];
}
