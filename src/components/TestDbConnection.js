// src/components/TestDbConnection.js
import React, { useState } from 'react';
import { testDBConnection } from '../services/api';

const TestDbConnection = () => {
    const [status, setStatus] = useState(null);

    const handleTestConnection = async () => {
        try {
            const result = await testDBConnection();
            setStatus(result);
        } catch (error) {
            setStatus({ error: "Failed to connect to database" });
        }
    };

    return (
        <div>
            <button className="btn" onClick={handleTestConnection}>Test Database Connection</button>
            {status && (
                <div>
                    {status.error ? (
                        <p className="error">{status.error}</p>
                    ) : (
                        <p>Database: {status.database}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestDbConnection;
