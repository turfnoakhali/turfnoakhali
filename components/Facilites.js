import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Facilites = () => {
    return (
        <>
            <section className='our-facilities'>
                <div className="container">
                    <h2 className='primary-heading our-facilities__heading'>Our Facilites</h2>
                    <div className='our-facilities__content' style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className='our-facilities__column' style={{ maxWidth: '600px', width: '100%' }}>
                            <h3 className='our-facilities__list-heading'>Turf Noakhali Facilities</h3>
                            <div className='our-facilities__list-wrap'>
                                <ul className='our-facilities__list'>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>First Aid</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Cold water</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Video recording (3 goals per slot)</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Goalkeeping gloves</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Apron & Bibs</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Changing room</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Washroom & Shower</li>
                                    <li className='our-facilities__list-item our-facilities__list-item--green'>Cricket & Football accessories</li>
                                </ul>
                            </div>
                            <Link href="/booking">
                                <span className='secondary-button our-facilities__button'>Book Now</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Facilites