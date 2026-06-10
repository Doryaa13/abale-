import React from 'react';

const AdPlaceholder = ({ width = '100%', height = '50px', label = 'פרסומת' }) => {
    return (
        <div style={{
            width: width,
            height: height,
            backgroundImage: 'url(/images/ad_banner_1.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid #4a5568',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '20px auto',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            {/* Dark overlay to ensure text readability if needed, or just let the image shine */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>

            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#4a5568',
                color: 'white',
                fontSize: '0.6rem',
                padding: '2px 4px',
                borderBottomLeftRadius: '4px',
                zIndex: 10
            }}>Ad</div>
        </div>
    );
};

export default AdPlaceholder;
