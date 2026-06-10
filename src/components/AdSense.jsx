import React, { useEffect } from 'react';

const AdSense = ({ style = {}, client = 'ca-pub-2656222814993117', slot }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div style={{ overflow: 'hidden', textAlign: 'center', ...style }}>
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={client}
                data-ad-slot={slot} // Optional: specific slot ID if user created ad units
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            {/* Fallback Label for Development/Pending Approval */}
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                Google AdSense
            </div>
        </div>
    );
};

export default AdSense;
