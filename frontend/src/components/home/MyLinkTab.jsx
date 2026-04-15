import { useLocation } from 'react-router-dom';

export default function MyLinkTab() {
  const location = useLocation();
  const link = location.state.link;

  return (
    <div>
      <p>{link.short_code}</p>
      <div>
        <p>Your QR-code:</p>
      </div>
      <h1>Stats</h1>
      <button>DELETE</button>
    </div>
  );
}
