import { useState } from 'react';

function App() {
    const [isActive, setIsActive] = useState(true);

    return (
        <div className='h-full bg-gradient-to-br from-indigo-50 to-blue-50'>
            <div className='p-6'>
                {/* Header */}
                <div className='mb-6 flex items-center gap-3'>
                    <div className='text-2xl'>👑</div>
                    <div>
                        <h1 className='text-xl font-bold text-gray-900'>Viceroy</h1>
                        <p className='text-sm text-gray-600'>Monarch App Assistant</p>
                    </div>
                </div>

                {/* Status */}
                <div className='mb-6'>
                    <div className='flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                            <span className='text-sm font-medium text-gray-700'>
                                {isActive ? 'Active on Monarch' : 'Inactive'}
                            </span>
                        </div>
                        <button
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                isActive
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setIsActive(!isActive)}
                        >
                            {isActive ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className='space-y-3'>
                    <h3 className='text-sm font-semibold tracking-wide text-gray-700 uppercase'>Features</h3>
                    <div className='space-y-2'>
                        <div className='cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-colors hover:border-indigo-200'>
                            <div className='text-sm font-medium text-gray-900'>Console Logger</div>
                            <div className='mt-1 text-xs text-gray-600'>Logs extension activity to browser console</div>
                        </div>
                        <div className='cursor-pointer rounded-lg border bg-white p-3 opacity-50 shadow-sm transition-colors hover:border-indigo-200'>
                            <div className='text-sm font-medium text-gray-900'>Page Enhancer</div>
                            <div className='mt-1 text-xs text-gray-600'>
                                Coming soon - enhance Monarch app functionality
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-8 border-t border-gray-200 pt-4'>
                    <div className='text-center text-xs text-gray-500'>Version 1.0.0</div>
                </div>
            </div>
        </div>
    );
}

export default App;
