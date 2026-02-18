import { useState } from 'react';

const VALID_KEYS = {
    'CRN-8821': { id: 'charan', name: 'Charan' },
    'SRT-9932': { id: 'sarthak', name: 'Sarthak' },
    'SNK-7743': { id: 'sanket', name: 'Sanket' },
};

export function LoginPage({ onLogin }) {
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = VALID_KEYS[accessKey.trim()];
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid Access Key. Please try again.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top, #1f2937 0, #020617 55%, #000 100%)',
            color: '#f8fafc',
        }}>
            <div style={{
                background: '#1e293b',
                padding: '40px',
                borderRadius: '16px',
                border: '1px solid #334155',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}>
                <h1 style={{ marginBottom: '8px', fontSize: '2rem' }}>Alpha<span style={{ color: '#6366f1' }}>Journal</span></h1>
                <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Enter your unique access key to continue</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <input
                            type="text"
                            placeholder="Enter Access Key (e.g., CRN-xxxx)"
                            value={accessKey}
                            onChange={(e) => {
                                setAccessKey(e.target.value);
                                setError('');
                            }}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                background: '#0f172a',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box', // Ensure padding doesn't affect width
                            }}
                        />
                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', textAlign: 'left' }}>{error}</p>}
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.1s',
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Access Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
