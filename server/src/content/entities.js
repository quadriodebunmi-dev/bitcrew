import { f } from '../lib/fields.js';

// Repeatable collections. `list` tells the dashboard which fields to show in the table.
export const ENTITIES = {
  services: {
    label: 'Services',
    singular: 'service',
    help: 'Only mark a service “Available to clients” when the team can deliver it today.',
    list: { title: 'title', subtitle: 'summary', image: 'image', badge: 'status' },
    fields: [
      f.text('title', 'Name', { required: true }),
      f.select('status', 'Availability', [['available', 'Available to clients'], ['community', 'Community activity'], ['planned', 'Planned']]),
      f.textarea('summary', 'Short description', { rows: 3, required: true }),
      f.strings('features', 'What is included (optional)'),
      f.image('image', 'Image (optional)'),
    ],
  },
  programs: {
    label: 'Academy and learning',
    singular: 'programme',
    help: 'Label future initiatives as Planned or Coming soon. Do not present them as open.',
    list: { title: 'title', subtitle: 'summary', image: 'image', badge: 'status' },
    fields: [
      f.text('title', 'Title', { required: true }),
      f.select('type', 'Type', [['academy', 'Academy'], ['webinar', 'Webinar or event'], ['workshop', 'Workshop'], ['outreach', 'Outreach']]),
      f.select('status', 'Status', [['open', 'Open now'], ['soon', 'Coming soon'], ['planned', 'Planned'], ['past', 'Past']], { default: 'planned' }),
      f.text('date', 'Date or timing (optional)', { help: 'e.g. 14 March 2027 or “Early 2027”' }),
      f.textarea('summary', 'Description', { rows: 4, required: true }),
      f.url('link', 'Registration or info link (optional)'),
      f.text('linkLabel', 'Link text', { help: 'e.g. Register' }),
      f.image('image', 'Image (optional)'),
    ],
  },
  projects: {
    label: 'Projects and outreach',
    singular: 'project',
    list: { title: 'title', subtitle: 'summary', image: 'image', badge: 'category' },
    fields: [
      f.text('title', 'Title', { required: true }),
      f.select('category', 'Category', [['Student outreach', 'Student outreach'], ['Event', 'Event'], ['Client project', 'Client project'], ['Community project', 'Community project']]),
      f.text('date', 'When (optional)', { help: 'e.g. October 2025' }),
      f.text('location', 'Where (optional)'),
      f.textarea('summary', 'Summary', { rows: 4, required: true }),
      f.text('impactFigure', 'Impact figure (optional)', { help: 'e.g. 2,500+' }),
      f.text('impactLabel', 'What the figure counts', { help: 'e.g. students reached' }),
      f.bool('verified', 'This figure has been verified'),
      f.image('image', 'Cover image'),
      f.images('gallery', 'More photos'),
      f.youtube('video', 'YouTube video (optional)', { help: 'Paste a YouTube link. It plays inside the project window.' }),
    ],
  },
  team: {
    label: 'Team',
    singular: 'person',
    list: { title: 'name', subtitle: 'role', image: 'photo' },
    fields: [
      f.text('name', 'Name', { required: true }),
      f.text('role', 'Role'),
      f.textarea('bio', 'Short bio', { rows: 4 }),
      f.image('photo', 'Photo'),
      f.list('links', 'Links', [f.text('label', 'Label'), f.url('url', 'Link')]),
    ],
  },
  partners: {
    label: 'Partners',
    singular: 'partner',
    list: { title: 'name', subtitle: 'type', image: 'logo' },
    fields: [
      f.text('name', 'Name', { required: true }),
      f.select('type', 'Type', [['School', 'School'], ['Business', 'Business'], ['Organisation', 'Organisation'], ['Professional', 'Professional'], ['Sponsor', 'Sponsor']]),
      f.image('logo', 'Logo'),
      f.url('website', 'Website (optional)'),
    ],
  },
  videos: {
    label: 'Videos',
    singular: 'video',
    help: 'Upload the video to YouTube first (public or unlisted), then paste its link here. Videos appear in the “Watch” section on the home page.',
    list: { title: 'title', subtitle: 'description', youtube: 'youtube' },
    fields: [
      f.youtube('youtube', 'YouTube link', { required: true, help: 'Works with youtube.com/watch, youtu.be, Shorts and embed links.' }),
      f.text('title', 'Title', { required: true }),
      f.textarea('description', 'Description', { rows: 3 }),
    ],
  },
  gallery: {
    label: 'Gallery',
    singular: 'photo',
    help: 'These photos fill the hero cards and the rotating gallery on the home page.',
    list: { title: 'title', subtitle: 'description', image: 'image', badge: 'showInHero' },
    fields: [
      f.image('image', 'Photo', { required: true }),
      f.text('title', 'Title', { required: true, help: 'Shown beside the rotating gallery.' }),
      f.textarea('description', 'Caption', { rows: 3 }),
      f.bool('showInHero', 'Show in the hero cards'),
    ],
  },
};
