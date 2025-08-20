import Task from "./Task";

const Column = ({ column, tasks, onEdit, onDelete, onDragStart, onDrop }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 flex flex-col"
      onDragOver={handleDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <h3 className="text-xl font-semibold mb-4 text-center">{column.title}</h3>
      <div className="flex-grow p-2 rounded-md transition-colors duration-200">
        {tasks.map((task) =>
          task ? (
            <Task
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
            />
          ) : null
        )}
      </div>
    </div>
  );
};

export default Column;
