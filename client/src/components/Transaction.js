import React from 'react';

const Transaction = ({ transaction }) => {
    const { input, outputMap } = transaction;
    const recArray = Object.keys(outputMap);

    return (
        <div>
            <div>
                From: {`${input.address.substring  (0, 20)}...`} | Balance: {input.amount}
            </div>
            {
                recArray.map(rec => (
                    <div key={rec}>
                        To: {`${rec.address.substring(0, 20)}...`} | Sent: {outputMap[rec]}
                    </div>
                    )
                )
            }
        </div>
    )
}

export default Transaction;