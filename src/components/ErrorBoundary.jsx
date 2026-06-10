
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    background: '#0b1120',
                    color: 'white'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>אופס! משהו השתבש</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                        האפליקציה נתקלה בשגיאה לא צפויה.
                    </p>
                    <button
                        onClick={() => {
                            window.location.href = '/';
                            window.location.reload();
                        }}
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        רענן את העמוד
                    </button>
                    {this.state.error && (
                        <pre style={{ marginTop: '20px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', maxWidth: '100%', overflow: 'auto', fontSize: '0.8rem', color: '#f87171' }}>
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
