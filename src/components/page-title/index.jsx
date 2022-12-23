import React from 'react'

function PageTitle({title}) {
    return (
        <div class="pagetitle">
            <h1>{title}</h1>
            {/* <nav>
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                    <li class="breadcrumb-item active">Dashboard</li>
                </ol>
            </nav> */}
        </div>
    )
}

export default PageTitle