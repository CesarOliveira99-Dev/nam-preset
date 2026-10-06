export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: MailAttachment[];
};

export type MailAttachment = {
  filename: string;
  path: string;
};

/**
 * Porta de e-mail. O handler depende disto, não do Nodemailer.
 */
export interface MailerPort {
  send(message: MailMessage): Promise<void>;
}
