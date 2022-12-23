import React from 'react'
import MaterialTable from "@material-table/core";
// import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityIcon from '@material-ui/icons/Visibility';

function DataTable(props) {
    return (
        <MaterialTable
            columns={props.column}
            data={props.data}
            title={props.title}
            isLoading={props.loading}
            options={{
                search: true,
                sorting: true,
                actionsColumnIndex: -1,
                rowStyle: {
                    backgroundColor: '#fff',
                },
                headerStyle: {
                    backgroundColor: '#01579b',
                    color: '#FFF'
                }
            }}
            actions={
                props.title === 'User list' ? [
                    {
                        icon: 'edit',
                        tooltip: 'Edit user',
                        onClick: (event, rowData) => props.edituser(rowData)

                    }
                ]
                    :
                    props.title === 'Department list' ? [
                        {
                            icon: 'edit',
                            tooltip: 'Edit department',
                            onClick: (event, rowData) => props.editDepartment(rowData)
                        }
                    ] :
                        props.title === 'Program list' ? [
                            {
                                icon: 'edit',
                                tooltip: 'Edit program',
                                onClick: (event, rowData) => props.editProgram(rowData)
                            }

                        ]:
                        props.title === 'Batch list' ? [
                            {
                                icon: 'edit',
                                tooltip: 'Edit batch',
                                onClick: (event, rowData) => props.editBatch(rowData)
                            }

                        ]
                        :
                        props.title === 'Paper list' ? [
                            {
                                icon: 'edit',
                                tooltip: 'Edit paper',
                                onClick: (event, rowData) => props.editPaper(rowData)
                            }

                        ]
                            :
                        props.title === 'Club list' ? [
                            {
                                icon: () => <VisibilityIcon />,
                                tooltip: 'View club',
                                onClick: (event, rowData) => props.viewClub(rowData)
                            },
                            {
                                icon: 'edit',
                                tooltip: 'Edit club',
                                onClick: (event, rowData) => props.editClub(rowData)
                            }

                        ]
                            :
                            props.title === 'Student list' ? [
                                {
                                    icon: 'edit',
                                    tooltip: 'Edit student',
                                    onClick: (event, rowData) => props.editStudent(rowData)
                                }
    
                            ]:
                            props.title === 'Notice list' ? [
                                {
                                    icon: 'edit',
                                    tooltip: 'Edit Notice',
                                    onClick: (event, rowData) => props.editNotice(rowData)
                                }
    
                            ]:
                            props.title === 'Event list' ? [
                                {
                                    icon: 'edit',
                                    tooltip: 'Edit Notice',
                                    onClick: (event, rowData) => props.editEvent(rowData)
                                }
    
                            ]:
                            []
            }
        />
    )
}

export default DataTable


