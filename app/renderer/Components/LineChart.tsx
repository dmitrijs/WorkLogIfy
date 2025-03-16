import React from 'react';

const LineChart = ({ className, total = 100, progress_normal = 0, progress_info = 0, progress_warning = 0, progress_success = 0, height = 2 }:any) => {
    const percent_normal = Math.round((progress_normal * 100.0) / total);
    const percent_info = Math.round((progress_info * 100.0) / total);
    const percent_warning = Math.round((progress_warning * 100.0) / total);
    const percent_success = Math.round((progress_success * 100.0) / total);

    return (
        <div className={className + " LineChart progress"} style={{ height: `${height}px` }}>
            <div className="progress-bar bg-normal" role="progressbar" style={{ width: `${percent_normal}%` }}></div>
            <div className="progress-bar bg-info" role="progressbar" style={{ width: `${percent_info}%` }}></div>
            <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${percent_warning}%` }}></div>
            <div className="progress-bar bg-success" role="progressbar" style={{ width: `${percent_success}%` }}></div>
        </div>
    );
};

export default LineChart;
