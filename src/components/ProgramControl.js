// src/components/ProgramControl.js
import React, { useState } from 'react';
import { startSession } from '../services/api';

const ProgramControl = () => {
    const [sessionName, setSessionName] = useState('');
    const [programName, setProgramName] = useState('');
    const [response, setResponse] = useState(null);

    const handleStartProgram = async () => {
        try {
            const result = await startSession(sessionName, programName);
            setResponse(result);
        } catch (error) {
            setResponse({ error: "Failed to start program" });
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Session Name"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Program Name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
            />
            <button className="btn" onClick={handleStartProgram}>Start Program</button>
            {response && (
                <div>
                    {response.error ? (
                        <p className="error">{response.error}</p>
                    ) : (
                        <p>{response.message}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgramControl;
