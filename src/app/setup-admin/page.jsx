'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const SetupAdminPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const setupAdmin = async () => {
    if (!session) {
      setMessage('Necesitas estar logueado para configurar admin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('¡Éxito! Ahora eres administrador. Redirigiendo...');
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/check-admin');
      const data = await response.json();
      setMessage(`Estado actual: ${data.isAdmin ? 'Eres admin' : 'No eres admin'} - Rol: ${data.role || 'USER'}`);
    } catch (error) {
      setMessage('Error verificando estado');
    }
  };

  if (status === 'loading') {
    return <div style={{ padding: '20px' }}>Cargando...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Configuración de Administrador</h1>
        <p>Necesitas estar logueado para configurar permisos de admin.</p>
        <button onClick={() => router.push('/login')}>
          Ir a Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Configuración de Administrador</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Usuario actual:</strong> {session.user.email}</p>
        <p><strong>Nombre:</strong> {session.user.name}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={checkAdminStatus}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Verificar Estado Admin
        </button>

        <button 
          onClick={setupAdmin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Configurando...' : 'Convertirme en Admin'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('Error') ? '#fecaca' : '#dcfce7',
          border: `1px solid ${message.includes('Error') ? '#ef4444' : '#22c55e'}`,
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '5px' }}>
        <h3>Instrucciones:</h3>
        <ol>
          <li>Verifica tu estado actual de admin</li>
          <li>Si no eres admin, haz clic en &quot;Convertirme en Admin&quot;</li>
          <li>Una vez configurado, podrás acceder a /admin</li>
          <li>Esta página se puede eliminar después de la configuración</li>
        </ol>
      </div>
    </div>
  );
};

export default SetupAdminPage;
