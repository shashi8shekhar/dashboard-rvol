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
    }
});

export default styles;
