import React from 'react'
import loadingUiGif from "../assests/loadingUi.gif"

export default function LoadingUi() {
    return (
        <div className='flex justify-center items-center' style={{ height: "98vh" }}>
            <img src={loadingUiGif} alt="" className='' style={{ width: "100px", height: "100px" }} />
        </div>
    )
}
