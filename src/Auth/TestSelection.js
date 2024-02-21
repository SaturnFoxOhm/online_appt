import Navbar from './navbar';
import './css/TestSelection.css';

const TestSelection = () => {
    
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                    <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `50%` }}> 50 %</div>
                </div>
                <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                    Appoint Health Checkup
                </h2>
                </div>

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap">Test Selection</p>
                    <br/>
                    <div>
                        <a href="#" className="button">Package</a><br/>
                        <a href="#" className="button">Specific Disease</a><br/>
                        <a href="/user/LabTest" className="button">Lab Test</a><br/>
                        <a href="/user/NHSO" className="button">Reimbursement with NHSO</a><br/>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default TestSelection;