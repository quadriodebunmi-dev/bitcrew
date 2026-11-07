const PATHS = {
  arrow: 'M7 17 17 7M8 7h9v9',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  up: 'm6 14 6-6 6 6',
  down: 'm6 10 6 6 6-6',
  trash: 'M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12M10 11v5m4-5v5',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9.5-13.5 4 4',
  upload: 'M12 16V5m0 0-4 4m4-4 4 4M5 19h14',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  home: 'm4 11 8-7 8 7v8H5v-8Zm5 8v-5h6v5',
  layers: 'm12 4 8 4-8 4-8-4 8-4Zm-8 8 8 4 8-4M4 16l8 4 8-4',
  calendar: 'M5 6h14v13H5zM5 10h14M9 4v4m6-4v4',
  folder: 'M4 6h6l2 2h8v11H4z',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 8c0-3 2.2-5 5-5s5 2 5 5M16 11a2.5 2.5 0 1 0 0-5m1 8c2 .3 3 1.8 3 4',
  handshake: 'M3 12l4-4 4 2 3-2 4 4-5 5-2-1-2 1-6-5Z',
  camera: 'M4 8h4l1.5-2h5L16 8h4v11H4zM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
  inbox: 'M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3 2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2L9.5 3l-3 1 .5 2L5.5 7.5 3.5 7l-1 3 2 1v2l-2 1 1 3 2-.5L7 18.5l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1v-2Z',
  logout: 'M10 5H5v14h5M14 8l4 4-4 4M18 12H9',
  external: 'M14 5h5v5M19 5l-8 8M18 14v5H5V6h5',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4',
  refresh: 'M20 11a8 8 0 0 0-14-4L4 9m0-4v4h4M4 13a8 8 0 0 0 14 4l2-2m0 4v-4h-4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  play: 'M8 5v14l11-7L8 5Z',
  star: 'm12 4 2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6L7.1 19.2 8 13.7 4 9.8 9.6 9 12 4Z',
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.8 }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name] || ''} />
    </svg>
  );
}
