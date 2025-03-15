import React from 'react';
import _ from 'lodash';
import { useStoreContext } from '../Store/Store';

const TodosWindow = () => {
    const store = useStoreContext();
    const tasks = _.sortBy(store.state.asanaTasks, 'assignee_section.name');

    return (
        <div className="TodosWindow">
            <button onClick={() => store.loadAsanaTasks(true)}>Refresh tasks list</button>
            <table>
                <thead>
                <tr>
                    <th>section</th>
                    <th>name</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map((task) => (
                    <tr key={task.gid}>
                        <td style={{ whiteSpace: 'nowrap' }}>{task.assignee_section.name}</td>
                        <td>
                            [<a href={task.permalink_url} target="_blank" rel="noopener noreferrer">view</a>]
                            {task.name}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TodosWindow;
