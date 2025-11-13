import React from 'react';
import PropTypes from 'prop-types';

const StatDetail = ({ title, value }) => (
    <div className="text-center p-3 rounded-xl bg-white/30 backdrop-blur-sm">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

const NilaiAkhirCard = ({ finalScore, scores }) => {
    return (
        <div className="bg-gradient-to-b from-purple-300 to-indigo-300 p-6 rounded-2xl shadow-lg">
            <div className="flex justify-items-center mb-4 grid grid-rows-2">                
                <div className="text-5xl font-bold text-primary">
                    {finalScore}
                </div>
                <h2 className="text-xl font-semibold text-primary">Nilai Akhir</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-6 mt-6 text-primary">
                <StatDetail  title="Nilai Proyek" value={scores.project} />
                <StatDetail title="UTS" value={scores.uts} />
                <StatDetail title="UAS" value={scores.uas} />
                <StatDetail title="Nilai Personal" value={scores.personal} />
            </div>
        </div>
    );
};

NilaiAkhirCard.propTypes = {
    finalScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    scores: PropTypes.shape({
        project: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        uts: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        uas: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        personal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
};

export default NilaiAkhirCard;