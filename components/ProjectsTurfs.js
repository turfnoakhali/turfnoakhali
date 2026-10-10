import React from 'react'
import Image from 'next/image'

import SkyTurf from '@/public/images/skyturf.webp'
import TimeUpTurf from '@/public/images/timeupturf.webp'

const ProjectsTurfs = () => {
    return (
        <>
            <div className="projects__turfs">
                <div className="projects__turf">
                    <div className="projects__turf-image-wrap">
                        <Image
                            src={SkyTurf}
                            alt='Turf Noakhali'
                            width={500}
                            className='projects__turf-image'
                        />
                    </div>
                    <div className="projects__turf-content-wrap">
                        <h3 className='projects__turf-heading'>Turf Noakhali</h3>
                        <p className='projects__turf-location'>Companigonj</p>
                        <p className='projects__turf-type'>Sports Turf</p>
                        <p className='projects__turf-est'>2024</p>
                        <p className='projects__turf-tag'>Owned & Operated by Turf Noakhali</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProjectsTurfs