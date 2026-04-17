import React, { useEffect, useRef, useState } from 'react';
import useLinks from '../hooks/useLinks.js';
import { useParams } from 'react-router-dom';

export default function RedirectPage() {
  const didRedirect = useRef(false);

  const { isLoading, checkRedirect } = useLinks();
  const { '*': shortCode } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shortCode || didRedirect.current) return;
    didRedirect.current = true;

    window.location.replace(
      `${import.meta.env.VITE_API_BASE_URL}/redirect/${shortCode}`
    );
  }, [shortCode, checkRedirect]);

  return <div>{!isLoading && error && <div>404 not found</div>}</div>;
}
