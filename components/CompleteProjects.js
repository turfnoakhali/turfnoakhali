import React from 'react'
import Image from 'next/image'

import SkyTurf from '@/public/images/skyturf.webp'
import TimeUpTurf from '@/public/images/timeupturf.webp'

const CompleteProjects = () => {
    return (
        <>
            <div className='projects__cards'>
                <div className="projects__card">
                    <div className="projects__card-image-wrap">
                        <Image
                            src={SkyTurf}
                            alt='Turf Noakhali'
                            className='projects__card-image'
                            width={600}
                        />
                    </div>
                    <div className="projects__card-content-wrap">
                        <h3 className='projects__card-heading'>Turf Noakhali</h3>
                        <p className='projects__card-text'>Turf Noakhali is a state-of-the-art artificial turf facility located in Companigonj. Fully owned and operated by Turf Noakhali, it offers a top-notch playing environment with premium artificial grass and floodlights for all football enthusiasts.</p>
                        <p className='projects__card-location'>Companigonj</p>
                    </div>
                </div>

                <div className="projects__card">
                    <div className="projects__card-image-wrap">
                        <Image
                            src={TimeUpTurf}
                            alt=''
                            className='projects__card-image'
                            width={600}
                        />
                    </div>
                    <div className="projects__card-content-wrap">
                        <h3 className='projects__card-heading'>Bandarban (UNO Project)</h3>
                        <p className='projects__card-text'>The Bandarban Officers Club turf was successfully constructed by Turf Noakhali and officially inaugurated on December 27. This project was developed under the Bandarban DC Office, which owns and manages the facility.
                            Turf Noakhali handled the complete construction process, from ground preparation to final finishing, ensuring high-quality delivery. The project received strong appreciation from the DC Sir and ADC Sir for its quality and execution.
                            This project highlights Turf Noakhali’ capability to deliver reliable and professional turf solutions for government institutions, meeting both technical standards and client expectations.</p>
                        <p className='projects__card-location'>Bandarban (UNO Project)</p>
                    </div>
                </div>

                <div className="projects__card">
                    <div className="projects__card-image-wrap">
                        <Image
                            src={TimeUpTurf}
                            alt=''
                            className='projects__card-image'
                            width={600}
                        />
                    </div>
                    <div className="projects__card-content-wrap">
                        <h3 className='projects__card-heading'>The Alikadam turf</h3>
                        <p className='projects__card-text'>The Alikadam turf project was developed for the UNO Office as an indoor 5-a-side facility. Completed and inaugurated in February, this project was fully constructed by Turf Noakhali.
                            The client expressed strong satisfaction with the quality and overall execution. This project reflects Turf Noakhali’ ability to deliver efficient and well-designed indoor turf solutions for government institutions.</p>
                        <p className='projects__card-location'>Alikadam</p>
                    </div>
                </div>

                <div className="projects__card">
                    <div className="projects__card-image-wrap">
                        <Image
                            src={TimeUpTurf}
                            alt=''
                            className='projects__card-image'
                            width={600}
                        />
                    </div>
                    <div className="projects__card-content-wrap">
                        <h3 className='projects__card-heading'>Feni turf</h3>
                        <p className='projects__card-text'>The Feni (Chhagalnaiya) turf project is a commercial 5-a-side field developed by Turf Noakhali. Located near the town area, it offers easy access for regular players. For this project, premium 47mm artificial grass was used to ensure better durability and playing experience.
                            This project reflects Turf Noakhali’ capability to deliver high-quality commercial turf solutions tailored for business use and long-term performance.</p>
                        <p className='projects__card-location'>Feni</p>
                    </div>
                </div>

                <div className="projects__card">
                    <div className="projects__card-image-wrap">
                        <Image
                            src={TimeUpTurf}
                            alt=''
                            className='projects__card-image'
                            width={600}
                        />
                    </div>
                    <div className="projects__card-content-wrap">
                        <h3 className='projects__card-heading'>Sattar Market turf</h3>
                        <p className='projects__card-text'>The Alikadam turf project was developed for the UNO Office as an indoor 5-a-side facility. Completed and inaugurated in February, this project was fully constructed by Turf Noakhali.
                            The client expressed strong satisfaction with the quality and overall execution. This project reflects Turf Noakhali’ ability to deliver efficient and well-designed indoor turf solutions for government institutions.</p>
                        <p className='projects__card-location'>Sattar Market</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CompleteProjects