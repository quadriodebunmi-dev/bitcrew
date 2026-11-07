import nodemailer from 'nodemailer';
import { config } from '../config.js';

const m = config.mail;
const transporter = m.host
  ? nodemailer.createTransport({
      host: m.host,
      port: m.port,
      secure: m.port === 465,
      auth: m.user ? { user: m.user, pass: m.pass } : undefined,
    })
  : null;

const labels = { contact: 'General enquiry', service: 'Service request', partnership: 'Partnership', community: 'Community join request' };

// Fire-and-forget: a failed email must never fail the visitor's form submission.
export async function notifySubmission(s) {
  if (!transporter || !m.notifyTo) return;
  const lines = [
    `Type: ${labels[s.type] || s.type}`,
    `Name: ${s.name}`,
    `Email: ${s.email}`,
    s.phone && `Phone: ${s.phone}`,
    s.organisation && `Organisation: ${s.organisation}`,
    s.skill && `Skill area: ${s.skill}`,
    s.subject && `Subject: ${s.subject}`,
    '',
    s.message,
  ].filter((l) => typeof l === 'string');
  try {
    await transporter.sendMail({
      from: m.from,
      to: m.notifyTo,
      replyTo: s.email,
      subject: `[BitCrew] ${labels[s.type] || 'New message'} from ${s.name}`,
      text: lines.join('\n'),
    });
  } catch (err) {
    console.error('[mail] failed to send notification:', err.message);
  }
}
