import Navbar from './navbar';
import './css/TestSelection.css';

const TestSelection = () => {  
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                    Appoint Health Checkup
                </h2>
                </div>

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap">Test Selection / ประเภทการทดสอบ</p>
                    <br/>
                    <div>
                        <a href="/user/Package" className="button">Package / แพ็กเกจ</a><br/>
                        <a href="/user/Disease" className="button">Specific Disease / โรคเฉพาะ</a><br/>
                        <a href="/user/LabTest" className="button">Lab Test / การทดสอบในห้องปฏิบัติการ</a><br/>
                        <a href="/user/NHSO" className="button">Reimbursement with NHSO / การทดสอบที่สามารถเบิกเงินกับ สปสช</a><br/>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default TestSelection;