import React, { useEffect } from 'react';
import { SHOW_AD_PLACEHOLDERS } from '../config/features';

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

            {SHOW_AD_PLACEHOLDERS ? (
                /* Visible placeholder so the ad locations are easy to see before
                   approval. Toggle SHOW_AD_PLACEHOLDERS off once real ads serve. */
                <div style={{
                    minHeight: '90px', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '4px',
                    border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)', color: '#64748b',
                }}>
                    <span style={{ fontSize: '1.3rem' }}>📢</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>מקום למודעה</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Google AdSense</span>
                </div>
            ) : (
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>
                    Google AdSense
                </div>
            )}
        </div>
    );
};

export default AdSense;
