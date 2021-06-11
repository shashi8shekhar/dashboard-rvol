export const hadleSqlConnection = (err, connection) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    if (connection) {
        console.log('connected as id ' + connection.threadId);
    }
};