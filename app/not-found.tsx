import Link from 'next/link';

export default function NotFound(): React.JSX.Element {
  return (
    <main
      style={{
        minHeight:      '100svh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '0 var(--pad-x)',
        gap:            '24px',
      }}
    >
      <p
        style={{
          fontFamily:  'var(--ff-mono)',
          fontSize:    '0.75rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:       'var(--t3)',
        }}
      >
        Error 404
      </p>

      <h1
        style={{
          fontFamily:  'var(--ff-display)',
          fontWeight:  800,
          fontSize:    'clamp(4rem, 12vw, 10rem)',
          lineHeight:  0.9,
          background:  'linear-gradient(135deg, #7B4FFF 0%, #FF5C35 60%, #35FFD4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip:       'text',
        }}
      >
