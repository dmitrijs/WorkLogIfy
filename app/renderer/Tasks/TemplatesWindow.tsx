import React from 'react';
import {useStoreContext} from "../Store/Store";

const TemplatesWindow = () => {
    const store = useStoreContext();

    const templates = store.getTaskTemplates();
    const projects = store.getTaskProjects();

    const updateProjects = (str) => {
        store.projectsUpdate([str.split(',').map((s) => s.trim())]);
    };

    const add = () => {
        store.templateNew();
    };

    const update = (idx, obj) => {
        store.templateUpdate([idx, obj]);
    };

    const del = (idx) => {
        store.templateDelete([idx]);
    };

    const swap = (idx1, idx2) => {
        const updatedTemplates = [...templates];
        [updatedTemplates[idx1], updatedTemplates[idx2]] = [updatedTemplates[idx2], updatedTemplates[idx1]];
        store.templateUpdate([idx2, updatedTemplates[idx2]]);
        store.templateUpdate([idx1, updatedTemplates[idx1]]);
    };

    React.useEffect(() => {
        store.setTaskTemplates(window.ipc.sendSync('tasks.getTaskTemplates'));
    }, []);

    return (
        <div className="TemplatesWindow">
            {templates.map((template, index) => (
                <div key={index}>
                    <div className="actions">
                        {index > 0 && (
                            <i className="IconAsInput icofont-arrow-up" onClick={() => swap(index, index - 1)}></i>
                        )}
                        {index < templates.length - 1 && (
                            <i className="IconAsInput icofont-arrow-down" onClick={() => swap(index, index + 1)}></i>
                        )}
                        <button type="button" onClick={() => del(index)} className="btn btn-xs btn-danger">delete</button>
                    </div>

                    <label>Title:</label> <input type="text" className="narrow" value={template.title} onChange={(e) => update(index, {...template, title: e.target.value})}/>
                    <label>Code:</label> <input type="text" className="narrow" placeholder="TSKS-0000" value={template.code} onChange={(e) => update(index, {...template, code: e.target.value})}/><br/>
                    <label>Notes:</label> <input type="text" value={template.notes} onChange={(e) => update(index, {...template, notes: e.target.value})} style={{width: '300px'}}/>
                    <i className={`IconAsInput icofont-not-allowed ${!template.chargeable ? 'active' : ''}`} onClick={() => update(index, {...template, chargeable: !template.chargeable})}></i>
                    <i className={`IconAsInput icofont-exchange ${template.distributed ? 'active' : ''}`} onClick={() => update(index, {...template, distributed: !template.distributed})}></i>
                    <i className={`IconAsInput icofont-unlock ${template.frozen ? 'active' : ''}`} onClick={() => update(index, {...template, frozen: !template.frozen})}></i>
                </div>
            ))}

            <button type="button" className="btn btn-xs btn-secondary" onClick={add}>+ add another</button>

            <br />
            <br />
            <hr />
            <br />
            <div className={"flex gap-2 items-center"}>
                <label className={"w-auto!"}>Projects:</label>
                <div className={"flex-1"}>
                    <input type="text" className={"w-full"} value={projects.join(', ')} onChange={(e) => updateProjects(e.target.value)}/><br />
                    <small>comma separated</small>
                </div>
            </div>

        </div>
    );
};

export default TemplatesWindow;
