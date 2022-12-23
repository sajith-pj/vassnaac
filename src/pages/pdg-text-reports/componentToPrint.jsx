import * as React from "react";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const ComponentToPrint = React.forwardRef((props, ref) => {

    let reportData = props?.reportData || {}
    const [numPages, setNumPages] = React.useState(null);
    console.log('reportDatareportData', reportData)
    function checkURL(url) {
        return (url?.match(/\.(jpeg|jpg|gif|png|bmp|jfif)$/) != null);
    }


    const imageData = (obj) => {
        if (obj !== null && checkURL(obj)) {
            return (
                <img className="report-image" src={obj} alt='' />
            )
        } else if (obj !== null) {
            return (
                <Document file={obj}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                    {Array.apply(null, Array(numPages))
                        .map((x, i) => i + 1)
                        .map(page => <Page pageNumber={page} />)}
                </Document>
            )
        }
    }


    return (
        <div ref={ref} className='canvas_div_pdf'>
            {reportData.map((obj, ky) => {
                return (
                    <div style={{ width: '100%' }} key={ky}>
                        {obj?.file2 ? (
                            <div style={{ width: '100%', height: 'auto', marginTop: '10px', display: 'flex', flexDirection: 'column', }}>
                                <div>
                                    {imageData(obj?.file2)}
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '3px' }}>
                                    <span>User name: {obj?.created_by?.username} </span>
                                    <span>User ID: {obj?.created_by.id} </span>
                                    <span>Criterion: {obj?.criterion}</span>
                                    <span>Data ID: {obj?.id} </span>
                                </div>
                                <hr/>
                            </div>
                        ) : ""}
                        {obj.file3 ? (
                            <div style={{ width: '100%', height: 'auto', marginTop: '10px', display: 'flex', flexDirection: 'column', }}>
                                <div>
                                    {imageData(obj.file3)}
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '3px' }}>
                                    <span>User name: {obj?.created_by?.username} </span>
                                    <span>User ID: {obj?.created_by?.id} </span>
                                    <span>Criterion: {obj.criterion}</span>
                                    <span>Data ID: {obj.id} </span>
                                </div>
                                <hr/>
                            </div>
                        ) : ""}
                        {obj?.file4 ? (
                            <div style={{ width: '100%', height: 'auto', marginTop: '10px', display: 'flex', flexDirection: 'column', }}>
                                <div>
                                    {imageData(obj.file4)}
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '3px' }}>
                                    <span>User name: {obj?.created_by?.username} </span>
                                    <span>User ID: {obj?.created_by?.id} </span>
                                    <span>Criterion: {obj.criterion}</span>
                                    <span>Data ID: {obj.id} </span>
                                </div>
                                <hr/>
                            </div>
                        ) : ""}
                        {obj?.file5 ? (
                            <div style={{ width: '100%', height: 'auto', marginTop: '10px', display: 'flex', flexDirection: 'column', }}>
                                <div>
                                    {imageData(obj.file5)}
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '3px' }}>
                                    <span>User name: {obj?.created_by?.username} </span>
                                    <span>User ID: {obj?.created_by?.id} </span>
                                    <span>Criterion: {obj.criterion}</span>
                                    <span>Data ID: {obj.id} </span>
                                </div>
                                <hr/>
                            </div>
                        ) : ""}
                    </div>
                );
            })}
        </div>
    );
});

export default ComponentToPrint