import React from 'react';
import PropTypes from 'prop-types';

const ProjectInfoCard = ({ data }) => {
    return (
        <div className="bg-transparent m-6">
            <p className="justify-center text-lg font-semibold text-primary mb-4">Nilai Proyek Saat Ini</p>
            <div className="flex items-center justify-items-center space-x-8 grid grid-rows-2">
                {/* Nilai Besar */}
                <div className="text-8xl font-extrabold text-primary">
                    {data.currentScore}
                </div>
                
                {/* Detail Proyek */}
                {/* <div> */}
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{data.projectTitle}</h3>
                    <p className="text-sm text-gray-600 mb-3">{data.projectDesc}</p>
                    
                    <ul className="text-sm space-y-1 justify-items-center">
                        <li className="text-gray-500">
                            <span className="font-medium text-gray-700">Deadline:</span> {data.deadline}
                        </li>
                        <li className="text-gray-500">
                            <span className="font-medium text-gray-700">Minggu ke:</span> {data.weeksLeft}
                        </li>
                        <li className="text-gray-500">
                            <span className="font-medium text-gray-700">Status:</span> 
                            <span className={`font-bold ml-1 ${data.status === 'On Track' ? 'text-green-500' : 'text-red-500'}`}>
                                {data.status}
                            </span>
                        </li>
                        <li className="text-gray-500">
                            <span className="font-medium text-gray-700">Last Update:</span> {data.lastUpdate}
                        </li>
                    </ul>
                {/* </div> */}
            </div>
        </div>
    );
};

ProjectInfoCard.propTypes = {
    data: PropTypes.shape({
        currentScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        projectTitle: PropTypes.string.isRequired,
        projectDesc: PropTypes.string.isRequired,
        deadline: PropTypes.string.isRequired,
        weeksLeft: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        lastUpdate: PropTypes.string.isRequired,
    }).isRequired,
};

export default ProjectInfoCard;