
import React from 'react';

const App = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold text-center mb-10">LiquidityX - LP Staking App</h1>
            <div className="max-w-2xl mx-auto mb-10 shadow-xl p-6 rounded-lg bg-gray-800">
                <p className="text-lg">Stake your LP Tokens here and earn rewards!</p>
                <div className="mt-6 flex justify-center gap-4">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Stake LP</button>
                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Unstake LP</button>
                </div>
            </div>
        </div>
    );
}

export default App;
