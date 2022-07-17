import { StyleSheet } from 'aphrodite';

const styles = StyleSheet.create({
    DashboardWrapper: {
        borderRadius: '2px',
        fontSize: '14px',
        lineHeight: '14px',
        minWidth: '100vw',
        minHeight: '100vh',
    },
    transformCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        flexWrap: 'wrap',
        height: 300,
        borderBottom: '1px solid #d8d8de',
    },
    ReloadButton: {
        lineHeight: '22px',
        padding: 5,
        width: 100,
        cursor: 'pointer',
        border: '1px solid #d8d8de',
        textAlign: 'center',
    },
    mainActionWrapper: {
        display: 'flex',
        margin: '20px 0',
        gap: 20,
    }
});

export default styles;
