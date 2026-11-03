import React from 'react';

const Map = () => {
    return (
        <section className='map'>
            <div className="container">
                <h2 className='primary-heading map__heading'>Our Location</h2>
                <div className="map__content">
                    <div className='map__skyturf'>
                        <iframe
                            src="https://maps.google.com/maps?q=Chowrasta-Maijdee+Road,+Begumganj,+Noakhali&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className='map__map'
                            title="The Turf Noakhali Location"
                        ></iframe>
                        <h3 className='map-turf-name' style={{ color: '#ffffff', fontSize: '24px', fontWeight: '800', marginTop: '16px' }}>The Turf Noakhali</h3>
                        <p className='map-turf-text' style={{ color: '#e4e4e7', fontSize: '15px' }}>জয়নাল আবেদীন স্কুল ও গ্লোব ফ্যাক্টরির মধ্যবর্তী, চৌরাস্তা-মাইজদী সড়ক, বেগমগঞ্জ, নোয়াখালী • Open 24/7</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Map;
