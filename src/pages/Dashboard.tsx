import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect dashboard to main index page
    navigate('/');
  }, [navigate]);

  return null;
}