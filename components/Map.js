import React from 'react'

const Map = () => {
    return (
        <>
            <section className='map'>
                <div className="container">
                    <h2 className='primary-heading map__heading'>Our Location</h2>
                    <div className="map__content">
                        <div className='map__skyturf'>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3655.023344707103!2d90.96260507438787!3d23.639334993033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37546900120d1447%3A0x129756cfae422568!2sCompanigonj%20Turf%20Zone!5e0!3m2!1sen!2sbd!4v1789580638671!5m2!1sen!2sbd"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className='map__map'
                            ></iframe>
                            <h3 className='our-turfs__turf-name'>Turf Noakhali</h3>
                            <p className='our-turfs__turf-text'>Premier Football Experience in Companigonj</p>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Map