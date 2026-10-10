import React from 'react'
import Image from 'next/image'
import SkyTurf from '@/public/images/skyturf.webp'
import TimeUpTurf from '@/public/images/timeupturf.webp'
import Link from 'next/link'

const Turfs = () => {
    return (
        <>
            <section className='our-turfs'>
                <div className="container">
                    <h2 className='primary-heading our-turfs__heading'>Our Turfs</h2>
                    <p className='our-turfs__text'>A good turf makes every game smoother and every player better. Step in, feel the field, and own the match</p>
                    <div className="our-turfs__content">
                        <Link href='/booking' className='our-turfs__wrapper'>
                            <div className="our-turfs__turf-wrap">
                                <div className='our-turfs__turf-image-wrap'>
                                    <Image
                                        src={SkyTurf}
                                        alt='Turf Noakhali'
                                        className='our-turfs__turf-image'
                                        width={600}
                                    />
                                    <span className='our-turfs__image-title'>Turf Noakhali</span>
                                </div>
                                <h3 className='our-turfs__turf-name'>Turf Noakhali</h3>
                                <p className='our-turfs__turf-text'>Premium football turf experience in Companigonj</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Turfs