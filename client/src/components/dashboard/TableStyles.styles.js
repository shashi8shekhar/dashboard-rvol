import { StyleSheet } from 'aphrodite';

// Table related Style
const tableStyles = StyleSheet.create({
    eachCell: {
        height: 38,
        textAlign: 'left',
        marginLeft: '0px',
        padding: '0px 0px 0px 0px',
    },
    alignLeft: {
        textAlign: 'left',
    },
    symbolCell: {
        display: 'flex !important',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    symbolName: {
        margin: 0,
        width: '100%',
    },
    lastUpdatedTime: {
        fontSize: 10,
        margin: 0,
    },
    linkTextCell: {
        textDecoration: 'underline',
        cursor: 'pointer',
        fontWeight: 500,
        textAlign: 'left',
    },
    dashboardPivotTableWrapper: {
        borderRadius: 2,
        backgroundColor: '#ffffff',
        margin: 0,
        borderTop: 'none',
    },
    tableHeader: {
        width: '100%',
        height: '100%',

        border: 'none',
        background: '#F9F9F9',
        '.active': {
            backgroundColor: '#EDF5FF',
        },
    },
    tableHeaderInnerWrap: {
        color: '#8E8CAA',
        verticalAlign: 'middle',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 500,

        display: 'flex',
        'justify-content': 'center',
        width: '100%',
        flexWrap: 'wrap',
    },
    lastUpdatedTimeLabel: {
        margin: 0,
        fontSize: 10,
    },
    totalCellWrapper: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        backgroundColor: '#DFDFE1',
    },
    totalCellValue: {
        fontSize: 12,
        fontWeight: 600,
        color: '#4A4956',
        width: '60%',
        display: 'inline-block',
        textAlign: 'right',
    },
    SingleCellValue: {
        fontSize: 12,
        fontWeight: 500,
        color: '#4A4956',
        width: '100%',
        display: 'inline-block',
        textAlign: 'right',
        verticalAlign: 'middle',
    },
    valueCell: {
        display: 'flex !important',
        justifyContent: 'space-between',
        gap: 20,
    },
    groupedCellValue: {
        fontWeight: 'bold',
        width: 'calc(100% - 26px)',
    },
    totalCellPercentage: {
        paddingRight: 0,
        color: '#4618d5',
        fontSize: 10,
        fontWeight: 500,
        width: '40%',
        display: 'inline-block',
        textAlign: 'right',
    },
    expandStyles: {
        'background-color': 'white',
        border: '1px solid #d3d3d3',
        'box-sizing': 'border-box',
        padding: '20px',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
    },
    defaultCursor: {
        cursor: 'default',
    },
    cellContent: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    flexContainer: {
        display: 'flex',
    },
    eachCellContentAlignEnd: {
        display: 'flex',
        'justify-content': 'space-between',
    },
    cellContentLink: {
        display: 'inline-block',
        width: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        color: '#3477F8',
        cursor: 'pointer',

        ':hover': {
            textDecoration: 'underline',
        },
    },
    checkbox: {
        margin: '2.5px 0 10px 0',
    },
    headerCheckbox: {
        position: 'relative',
        left: '-5px',
    },
});

export default tableStyles;