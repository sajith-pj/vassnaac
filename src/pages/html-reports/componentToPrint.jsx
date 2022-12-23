import * as React from "react";
import { useState } from "react";
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'
import './style.scss'
const ComponentToPrint = React.forwardRef((props, ref) => {

    let reportData = props?.reportData || {}
    const [numPages, setNumPages] = useState(null);

    const tdData = (jdoc) => {
        const rows = Object.values(jdoc)
        return rows.map((obj, index) => {
            return (
                <tr key={index}>
                    <td> {obj[0]} </td>
                    <td> {typeof obj[1] === 'boolean' ? obj[1] ? 'true' : 'false' : obj[1] } </td>
                </tr>
            )
        })
    }

    const imageData = (obj) => {
        if (obj !== null && checkURL(obj)) {
            return (
                <img alt='' className="report-image" src={obj} />
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

    function checkURL(url) {
        return (url?.match(/\.(jpeg|jpg|gif|png|bmp|jfif)$/) != null);
    }

    return (
        <div className="canvas_div_pdf" ref={ref}>
            {reportData.map((obj) => {
                return (
                    <>
                        <div className="item">
                            <table className="naac-table">
                                <thead>
                                    <tr>
                                        <th> User </th>
                                        <th> {obj.created_by.username} </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td> Department </td>
                                        <td> {obj.department ? obj.department.name : ""} </td>
                                    </tr>
                                    <tr>
                                        <td>Program </td>
                                        <td>{obj.program ? obj.program.name : ""}  </td>
                                    </tr>
                                    <tr>
                                        <td>Subject  </td>
                                        <td>{obj.paper ? obj.paper.name : ""}  </td>
                                    </tr>
                                    <tr>
                                        <td>Batch </td>
                                        <td> {obj.batch ? obj.batch.name : ""}   </td>
                                    </tr>
                                    <tr>
                                        <td>Date </td>
                                        <td> {obj.created_at}  </td>
                                    </tr>

                                </tbody>
                            </table>
                            <hr/>
                            <table className="naac-table">
                                <thead>
                                    <tr>
                                        <th> Data ID </th>
                                        <th> {obj.id} </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tdData(obj.jdoc)}
                                </tbody>
                            </table>
                        </div>

                        <hr/>

                        <div className="w-full  px-7 mt-2">
                            <div className="w-full grid grid-cols-1 md:grid-cols-1 gap-x-12 my-[60px]">
                                <div className="flex justify-start pr-2 mt-2">
                                    <div className="overflow-auto w-full mx-4">
                                        {imageData(obj.file2)}
                                    </div>
                                    <div className="overflow-auto w-full mx-4">
                                        {imageData(obj.file3)}
                                    </div>
                                    <div className="overflow-auto w-full mx-4">
                                        {imageData(obj.file4)}
                                    </div>
                                    <div className="overflow-auto w-full mx-4">
                                        {imageData(obj.file5)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            })}
        </div>
    );
});

export default ComponentToPrint