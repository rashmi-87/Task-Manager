const Task = ({ task, onEdit, onDelete, onDragStart }) => {
  if (!task) return null;

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "No date";

  const priority = (task.priority || "Medium").toLowerCase();

  const priorityClass =
    priority === "low"
      ? "bg-green-500"
      : priority === "medium"
      ? "bg-yellow-500"
      : priority === "high"
      ? "bg-red-500"
      : "bg-gray-400";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      className="bg-white dark:bg-gray-700 p-4 mb-4 rounded-lg shadow-md border-l-4 cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-lg">{task.title}</h4>
        <div className={`text-xs font-bold text-white px-2 py-1 rounded-full ${priorityClass}`}>
          {task.priority || "Medium"}
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 my-2">{task.description}</p>
      <div className="text-sm text-gray-500 dark:text-gray-300">
        Due: {dueDate}
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button onClick={() => onEdit(task)} className="text-sm text-blue-500 hover:underline">Edit</button>
        <button onClick={() => onDelete(task._id)} className="text-sm text-red-500 hover:underline">Delete</button>
      </div>
    </div>
  );
};

export default Task;
