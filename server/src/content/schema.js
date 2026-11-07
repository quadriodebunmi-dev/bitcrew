import { f } from '../lib/fields.js';

// Every editable block of the public site. `page` groups blocks in the dashboard sidebar.
const cta = (key, label) =>
  f.group(key, label, [f.text('label', 'Button text'), f.url('link', 'Button link', { help: 'e.g. /community or https://…' })]);

const heroFields = [
  f.text('title', 'Page title', { required: true }),
  f.textarea('subtitle', 'Subtitle', { rows: 3 }),
  f.image('image', 'Header image (optional)'),
];

export const CONTENT_SECTIONS = [
  // ---------------------------------------------------------------- Site
  {
    key: 'site',
    page: 'Site',
    label: 'Brand, contact and social links',
    fields: [
      f.text('brandName', 'Brand name', { required: true }),
      f.text('tagline', 'Tagline', { help: 'The established tagline. Keep as the primary brand line unless the founder approves a change.' }),
      f.text('slogan', 'Supporting slogan'),
      f.text('descriptor', 'Service descriptor'),
      f.image('logo', 'Logo (optional)', { help: 'Square or wide PNG/WebP with a transparent background. Leave empty to use the built-in bit mark.' }),
      f.textarea('seoDescription', 'Search engine description', { rows: 3, max: 300 }),
      f.image('ogImage', 'Social sharing image', { help: 'Shown when links are shared. 1200×630 works best.' }),
      f.text('founded', 'Founded'),
      f.email('email', 'Public email'),
      f.text('phone', 'Phone (optional)'),
      f.text('location', 'Location (optional)'),
      f.group('navCta', 'Header button', [f.text('label', 'Button text'), f.url('link', 'Button link')]),
      f.list('socials', 'Social links', [
        f.text('label', 'Platform'),
        f.text('handle', 'Handle'),
        f.url('url', 'Link', { help: 'Leave empty to show the handle without a link.' }),
      ]),
      f.textarea('footerNote', 'Footer text', { rows: 3 }),
    ],
  },

  // ---------------------------------------------------------------- Home
  {
    key: 'home.hero',
    page: 'Home',
    label: 'Hero',
    help: 'The hero cards are your Gallery photos marked “Show in hero”.',
    fields: [
      f.text('title', 'Headline', { required: true }),
      f.text('ghostWord', 'Large background word', { max: 12, help: 'One short word. Shown very large behind the headline.' }),
      f.textarea('subtitle', 'Subtitle', { rows: 3 }),
      cta('primaryCta', 'Primary button'),
      cta('secondaryCta', 'Secondary button'),
      f.text('note', 'Line under the buttons'),
    ],
  },
  {
    key: 'home.welcome',
    page: 'Home',
    label: 'Welcome',
    fields: [f.text('title', 'Heading'), f.textarea('body', 'Body', { rows: 8, help: 'Separate paragraphs with a blank line.' })],
  },
  {
    key: 'home.services',
    page: 'Home',
    label: 'Services preview',
    fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 3 }), f.text('linkLabel', 'Link text')],
  },
  {
    key: 'home.gallery',
    page: 'Home',
    label: 'Rotating gallery',
    help: 'The sphere is built from your Gallery photos. With no photos it shows your services.',
    fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 3 })],
  },
  {
    key: 'home.videos',
    page: 'Home',
    label: 'Watch section',
    help: 'Videos themselves are managed under Videos. The section is hidden until you add one.',
    fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 2 }), f.text('linkLabel', 'Link to Videos page')],
  },
  {
    key: 'home.team',
    page: 'Home',
    label: 'Team section',
    help: 'People themselves are managed under Team. The section is hidden until you add someone.',
    fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 2 }), f.text('linkLabel', 'Link to Team page')],
  },
  {
    key: 'home.approach',
    page: 'Home',
    label: 'How we work',
    fields: [
      f.text('title', 'Heading'),
      f.textarea('subtitle', 'Subtitle', { rows: 2 }),
      f.list('steps', 'Steps (in order)', [f.text('title', 'Step'), f.textarea('text', 'Description', { rows: 2 })]),
    ],
  },
  {
    key: 'home.stats',
    page: 'Home',
    label: 'Numbers',
    help: 'Only publish figures you can stand behind. Use the note to say where a figure comes from.',
    fields: [
      f.text('title', 'Heading'),
      f.list('items', 'Figures', [
        f.number('value', 'Number'),
        f.text('suffix', 'After the number', { max: 6, help: 'e.g. +' }),
        f.text('label', 'Label'),
        f.text('note', 'Source note (optional)'),
      ]),
    ],
  },
  {
    key: 'home.cta',
    page: 'Home',
    label: 'Closing call to action',
    fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 3 }), cta('button', 'Button')],
  },

  // ---------------------------------------------------------------- About
  { key: 'about.hero', page: 'About', label: 'Page header', fields: heroFields },
  { key: 'about.story', page: 'About', label: 'Our story', fields: [f.text('title', 'Heading'), f.textarea('body', 'Body', { rows: 8, help: 'Separate paragraphs with a blank line.' })] },
  {
    key: 'about.meaning',
    page: 'About',
    label: 'What the name means',
    fields: [
      f.text('title', 'Heading'),
      f.textarea('intro', 'Closing sentence', { rows: 3 }),
      f.list('items', 'Parts of the name', [f.text('term', 'Word'), f.textarea('text', 'Meaning', { rows: 2 })]),
    ],
  },
  {
    key: 'about.purpose',
    page: 'About',
    label: 'Mission, vision and why we exist',
    fields: [
      f.textarea('mission', 'Mission', { rows: 4 }),
      f.textarea('vision', 'Vision', { rows: 4 }),
      f.text('whyTitle', 'Why we exist: heading'),
      f.textarea('whyBody', 'Why we exist: body', { rows: 6, help: 'Separate paragraphs with a blank line.' }),
    ],
  },
  {
    key: 'about.values',
    page: 'About',
    label: 'Values',
    fields: [f.text('title', 'Heading'), f.list('items', 'Values', [f.text('title', 'Value'), f.textarea('text', 'Description', { rows: 2 })])],
  },
  { key: 'about.goals', page: 'About', label: 'Goals', fields: [f.text('title', 'Heading'), f.strings('items', 'Goals')] },
  { key: 'about.team', page: 'About', label: 'People heading', help: 'People themselves are managed under Team.', fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 2 })] },

  // ---------------------------------------------------------------- Team and Videos pages
  { key: 'team.hero', page: 'Team', label: 'Page header', fields: heroFields },
  { key: 'videos.hero', page: 'Videos', label: 'Page header', fields: [...heroFields, f.text('empty', 'Message when no videos are listed')] },

  // ---------------------------------------------------------------- Services
  { key: 'services.hero', page: 'Services', label: 'Page header', fields: heroFields },
  { key: 'services.notice', page: 'Services', label: 'Availability notice', fields: [f.textarea('text', 'Notice', { rows: 3 })] },
  { key: 'services.cta', page: 'Services', label: 'Request a service', fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 2 }), f.text('buttonLabel', 'Button text')] },

  // ---------------------------------------------------------------- Community
  { key: 'community.hero', page: 'Community', label: 'Page header', fields: heroFields },
  {
    key: 'community.audience',
    page: 'Community',
    label: 'Who it is for',
    fields: [f.text('title', 'Heading'), f.strings('items', 'People we welcome'), f.textarea('belief', 'Core belief', { rows: 3 })],
  },
  {
    key: 'community.benefits',
    page: 'Community',
    label: 'What members get',
    fields: [f.text('title', 'Heading'), f.list('items', 'Benefits', [f.text('title', 'Benefit'), f.textarea('text', 'Description', { rows: 2 })])],
  },
  {
    key: 'community.join',
    page: 'Community',
    label: 'Join form',
    fields: [
      f.text('title', 'Heading'),
      f.textarea('subtitle', 'Subtitle', { rows: 2 }),
      f.strings('skills', 'Skill areas in the dropdown'),
      f.textarea('successMessage', 'Message after sending', { rows: 2 }),
    ],
  },

  // ---------------------------------------------------------------- Academy
  { key: 'academy.hero', page: 'Academy', label: 'Page header', fields: heroFields },
  { key: 'academy.notice', page: 'Academy', label: 'Availability notice', fields: [f.textarea('text', 'Notice', { rows: 3 }), f.text('empty', 'Message when nothing is listed')] },
  { key: 'academy.interest', page: 'Academy', label: 'Stay informed', fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 2 }), f.text('buttonLabel', 'Button text')] },

  // ---------------------------------------------------------------- Projects
  { key: 'projects.hero', page: 'Projects', label: 'Page header', fields: heroFields },
  { key: 'projects.impact', page: 'Projects', label: 'Impact note', fields: [f.text('title', 'Heading'), f.textarea('note', 'Note about figures', { rows: 3 }), f.text('empty', 'Message when no projects are listed')] },

  // ---------------------------------------------------------------- Partnerships
  { key: 'partnerships.hero', page: 'Partnerships', label: 'Page header', fields: heroFields },
  {
    key: 'partnerships.ways',
    page: 'Partnerships',
    label: 'Ways to collaborate',
    fields: [f.text('title', 'Heading'), f.list('items', 'Ways', [f.text('title', 'Who'), f.textarea('text', 'How they can collaborate', { rows: 2 })])],
  },
  { key: 'partnerships.partners', page: 'Partnerships', label: 'Partners heading', fields: [f.text('title', 'Heading'), f.text('empty', 'Message when no partners are listed')] },
  { key: 'partnerships.form', page: 'Partnerships', label: 'Enquiry form', fields: [f.text('title', 'Heading'), f.textarea('subtitle', 'Subtitle', { rows: 2 }), f.textarea('successMessage', 'Message after sending', { rows: 2 })] },

  // ---------------------------------------------------------------- Contact
  { key: 'contact.hero', page: 'Contact', label: 'Page header', fields: heroFields },
  { key: 'contact.form', page: 'Contact', label: 'Contact form', fields: [f.text('title', 'Heading'), f.textarea('successMessage', 'Message after sending', { rows: 2 })] },

  // ---------------------------------------------------------------- Legal
  {
    key: 'privacy',
    page: 'Legal',
    label: 'Privacy notice',
    fields: [f.text('title', 'Heading'), f.text('updated', 'Last updated'), f.textarea('body', 'Body', { rows: 16, max: 12000, help: 'Separate paragraphs with a blank line. Have this reviewed before launch.' })],
  },
];

export const SECTION_MAP = Object.fromEntries(CONTENT_SECTIONS.map((s) => [s.key, s]));
